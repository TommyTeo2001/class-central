import React, { useEffect, useState, useContext } from "react";
import {
  Flex,
  Combobox,
  ComboboxOption,
  Box,
  TabPanel,
  Button,
  Typography,
  Status,
} from "@strapi/design-system";
import userRequest from "../../api/users.js";
import { Plus } from "@strapi/icons";
import courseOfferingRequest from "../../api/courseOffering.js";
import { EnrollmentContext } from "../../pages/hook/enrollContext.js";

const CourseOfferingTab = ({
  allUsers,
  setUserStartIndex,
  userTotal,
  setShowModal,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userValue, setUserValue] = useState("");
  const [courseOfferingValue, setCourseOfferingValue] = useState("");
  const [autocompleteMode, setAutocompleteMode] = useState({
    type: "list",
    filter: "contains",
  });
  const [allCourseOfferings, setAllCourseOfferings] = useState([]);
  const {
    setMainError,
    setErrorMessage,
    userEnrollmentToBeAdded,
    setUserEnrollmentToBeAdded,
  } = useContext(EnrollmentContext);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAllreadyAdded, setShowAllreadyAdded] = useState(false);

  const handleLoadMoreUser = () => setIsLoading(true);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  useEffect(() => {
    findAllCourseOfferings();
  }, []);

  const findAllCourseOfferings = async () => {
    courseOfferingRequest
      .findAll()
      .then((response) => {
        setAllCourseOfferings(response);
      })
      .catch((error) => {
        setMainError(true);
        setErrorMessage(error.message);
      });
  };

  const findCourseOfferingIndex = (
    userEnrollments,
    userId,
    courseOfferingId
  ) => {
    const userEnrollment = userEnrollments.find(
      (enrollment) => enrollment.userId === userId
    );
    return userEnrollment?.courseOfferings
      ? userEnrollment?.courseOfferings.findIndex(
          (courseOffering) =>
            courseOffering.courseOfferingId === courseOfferingId
        )
      : undefined;
  };

  const updateUserEnrollment = (userEnrollments, userId, courseOffering) => {
    return userEnrollments.map((enrollment) => {
      if (enrollment.userId === userId) {
        // check if courseOfferings is an array
        if (Array.isArray(enrollment.courseOfferings)) {
          enrollment.courseOfferings.push(courseOffering);
        } else {
          // create a new array with the classroomOffering
          enrollment.courseOfferings = [courseOffering];
        }
      }
      return enrollment;
    });
  };

  const handleCourseEnrollment = () => {
    // Find the user by email and get the id
    const user = allUsers.find((user) => user.email === userValue);
    const { id: userId, email: userEmail } = user;
    // Find the course offering by title and get the id
    const courseOffering = allCourseOfferings.find(
      (courseOffering) => courseOffering.offeringTitle === courseOfferingValue
    );
    const { id: courseOfferingId, offeringTitle: courseOfferingTitle } =
      courseOffering;
    // Check if user Id already exists in the array, if it does, add a new course offering to the user
    const userIndex = userEnrollmentToBeAdded.findIndex(
      (user) => user.userId === userId
    );

    if (userIndex === -1) {
      setUserEnrollmentToBeAdded([
        ...userEnrollmentToBeAdded,
        {
          userId,
          userEmail,
          courseOfferings: [
            {
              courseOfferingId,
              courseOfferingTitle,
            },
          ],
        },
      ]);
      setShowSuccess(true);
    } else {
      const courseOfferingIndex = findCourseOfferingIndex(
        userEnrollmentToBeAdded,
        userId,
        courseOfferingId
      );
      if (courseOfferingIndex === -1 || courseOfferingIndex === undefined) {
        const newUserEnrollmentToBeAdded = updateUserEnrollment(
          userEnrollmentToBeAdded,
          userId,
          {
            courseOfferingId,
            courseOfferingTitle,
          }
        );
        setUserEnrollmentToBeAdded(newUserEnrollmentToBeAdded);
        setShowSuccess(true);
      } else {
        setShowAllreadyAdded(true);
      }
    }
    // setUserValue("");
    // setCourseOfferingValue("");
  };

  const showSuccessMessage = () => {
    setTimeout(() => {
      setShowSuccess(false);
    }, 1000);
    return (
      <Status variant="success" showBullet={false}>
        <Typography fontWeight="bold">Successfully added enrollment</Typography>
      </Status>
    );
  };

  const showAllreadyAddedMessage = () => {
    setTimeout(() => {
      setShowAllreadyAdded(false);
    }, 2000);
    return (
      <Status variant="warning" showBullet={false}>
        <Typography fontWeight="bold">
          Course offering already added for that user
        </Typography>
      </Status>
    );
  };

  return (
    <TabPanel>
      <Box color="neutral800" padding={4} background="neutral0">
        <Box marginBottom={2}>
          <Typography fontWeight="bold" textColor="neutral400" as="h1">
            This tabs enrolls the user into the course offering
          </Typography>
        </Box>
        <Flex direction="column" alignItems="stretch" gap={10}>
          <Combobox
            placeholder="User"
            label="Select a User"
            value={userValue}
            onChange={setUserValue}
            onClear={() => setUserValue("")}
            loading={isLoading}
            onLoadMore={handleLoadMoreUser}
            autocomplete={autocompleteMode}
            hasMoreItems={true}
            required
          >
            {allUsers.map((user) => {
              return (
                <ComboboxOption key={user.id} value={user?.email}>
                  {user?.email}
                </ComboboxOption>
              );
            })}
          </Combobox>
          <Combobox
            placeholder="Course Offering"
            label="Select a Course Offering"
            onChange={() => {}}
            value={courseOfferingValue}
            onChange={setCourseOfferingValue}
            onClear={() => setCourseOfferingValue("")}
            loading={isLoading}
            onLoadMore={handleLoadMoreUser}
            hasMoreItems={true}
            autocomplete={autocompleteMode}
            required
          >
            {Array.isArray(allCourseOfferings) &&
              allCourseOfferings.map((courseOffering) => {
                return (
                  <ComboboxOption
                    key={courseOffering.id}
                    value={courseOffering?.offeringTitle}
                  >
                    {courseOffering?.offeringTitle}
                  </ComboboxOption>
                );
              })}
          </Combobox>
        </Flex>
        <Box marginTop={4}>
          {!userValue || !courseOfferingValue ? (
            <Typography fontWeight="bold" textColor="danger500" as="h1">
              All fields are required
            </Typography>
          ) : null}
        </Box>
        <Box>{showSuccess && showSuccessMessage()}</Box>
        <Box>{showAllreadyAdded && showAllreadyAddedMessage()}</Box>
        <Box marginTop={11} background="neutral0">
          <Flex alignItems="center" justifyContent="end" width={100} gap={2}>
            <Button
              startIcon={<Plus />}
              variant="primary"
              size="L"
              onClick={handleCourseEnrollment}
              disabled={!userValue || !courseOfferingValue}
            >
              Save and New
            </Button>
            <Button
              variant="primary"
              size="L"
              onClick={() => {
                handleCourseEnrollment();
                setShowModal(false);
              }}
              disabled={!userValue || !courseOfferingValue}
            >
              Save
            </Button>
          </Flex>
        </Box>
      </Box>
    </TabPanel>
  );
};

export default CourseOfferingTab;

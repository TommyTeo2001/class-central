import React, { useEffect, useState, useContext } from "react";
import {
  Flex,
  Combobox,
  ComboboxOption,
  Box,
  TabPanel,
  Button,
  MultiSelect,
  MultiSelectOption,
  Typography,
  Status,
  TextInput,
  NumberInput,
} from "@strapi/design-system";
import { Plus } from "@strapi/icons";
import classroomRequest from "../../api/classrooms.js";
import { EnrollmentContext } from "../../pages/hook/enrollContext.js";

const GroupTab = ({ allUsers, setShowModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [allClassrooms, setAllClassrooms] = useState([]);
  const [userValue, setUserValue] = useState("");
  const [numberOfSeats, setNumberOfSeats] = useState(2);
  const [classroomValue, setClassroomValue] = useState("");
  const [autocompleteMode, setAutocompleteMode] = useState({
    type: "list",
    filter: "contains",
  });
  const {
    setMainError,
    setErrorMessage,
    userEnrollmentToBeAdded,
    setUserEnrollmentToBeAdded,
  } = useContext(EnrollmentContext);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAllreadyAdded, setShowAllreadyAdded] = useState(false);
  const [hasGroupEnrollment, setHasGroupEnrollment] = useState(null);

  const handleLoadMore = () => setIsLoading(true);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  useEffect(() => {
    findAllClassrooms();
  }, []);

  const findAllClassrooms = async () => {
    classroomRequest
      .findAll()
      .then((r) => r.json())
      .then((response) => {
        const { data } = response;
        setAllClassrooms(data);
      })
      .catch((error) => {
        setMainError(true);
        setErrorMessage(error.message);
      });
  };

  const findClassroomOfferingIndex = (
    userEnrollments,
    userId,
    classroomOfferingId
  ) => {
    const userEnrollment = userEnrollments.find(
      (enrollment) => enrollment.userId === userId
    );
    return userEnrollment?.classroomOfferings
      ? userEnrollment?.classroomOfferings.findIndex(
          (classroomOffering) =>
            classroomOffering.classroomOfferingId === classroomOfferingId
        )
      : undefined;
  };

  const updateUserEnrollment = (userEnrollments, userId, classroomOffering) => {
    return userEnrollments.map((enrollment) => {
      if (enrollment.userId === userId) {
        // check if classroomOfferings is an array
        if (Array.isArray(enrollment.classroomOfferings)) {
          enrollment.classroomOfferings.push(classroomOffering);
        } else {
          // create a new array with the classroomOffering
          enrollment.classroomOfferings = [classroomOffering];
        }
      }
      return enrollment;
    });
  };

  const handleClassroomEnrollment = () => {
    // Find the user by email and get the id
    const user = allUsers.find((user) => user.email === userValue);
    const { id: userId, email: userEmail, firstName, lastName } = user;
    // Find the classroom by classroomAndclassroomOffering and get the id
    const classroom = allClassrooms.find(
      (classroom) =>
        classroom.attributes.classroomAndclassroomOffering === classroomValue
    );
    const {
      id: classroomOfferingId,
      attributes: { classroomAndclassroomOffering },
    } = classroom;
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
          firstName,
          lastName,
          classroomOfferings: [
            {
              classroomOfferingId,
              classroomAndclassroomOffering,
              role: "Admin",
              numberOfSeats,
            },
          ],
        },
      ]);
      setShowSuccess(true);
    } else {
      const classroomOfferingIndex = findClassroomOfferingIndex(
        userEnrollmentToBeAdded,
        userId,
        classroomOfferingId
      );
      if (
        classroomOfferingIndex === -1 ||
        classroomOfferingIndex === undefined
      ) {
        const newUserEnrollmentToBeAdded = updateUserEnrollment(
          userEnrollmentToBeAdded,
          userId,
          {
            classroomOfferingId,
            classroomAndclassroomOffering,
            role: "Admin",
            numberOfSeats,
          }
        );
        setUserEnrollmentToBeAdded(newUserEnrollmentToBeAdded);
        setShowSuccess(true);
      } else {
        setShowAllreadyAdded(true);
      }
    }
  };

  const validateGroupEnrollment = (classroomValue) => {
    // Find classroom offering by classroomValue
    const classroomOffering = allClassrooms.find(
      (classroom) =>
        classroom.attributes.classroomAndclassroomOffering === classroomValue
    );
    // check if classroom has groupPurchase set to true
    if (
      !!classroomOffering?.attributes?.groupPurchase &&
      !!classroomOffering?.attributes?.classroom?.data?.attributes
        ?.groupPurchase
    ) {
      setHasGroupEnrollment(true);
    } else {
      setHasGroupEnrollment(false);
    }
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
          Classroom offering already added for that user
        </Typography>
      </Status>
    );
  };

  return (
    <TabPanel>
      <Box color="neutral800" padding={4} background="neutral0">
        <Box marginBottom={2}>
          <Typography fontWeight="bold" textColor="neutral400" as="h1">
            This tabs enrolls the user into the classroom offering and creates a
            new group with the specified number of seats.
          </Typography>
        </Box>
        <Flex direction="column" alignItems="stretch" gap={8}>
          <Combobox
            placeholder="Select a User"
            label="User"
            value={userValue}
            onChange={setUserValue}
            onClear={() => setUserValue("")}
            loading={isLoading}
            onLoadMore={handleLoadMore}
            hasMoreItems={true}
            autocomplete={autocompleteMode}
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
          <div>
            <Combobox
              placeholder="Select a Classroom"
              label="Classroom"
              value={classroomValue}
              onChange={(value) => {
                setClassroomValue(value);
                validateGroupEnrollment(value);
              }}
              onClear={() => setClassroomValue("")}
              loading={isLoading}
              onLoadMore={handleLoadMore}
              hasMoreItems={true}
              autocomplete={autocompleteMode}
              required
            >
              {allClassrooms.map((classroom) => {
                return (
                  <ComboboxOption
                    key={classroom.id}
                    value={classroom?.attributes?.classroomAndclassroomOffering}
                  >
                    {classroom?.attributes?.classroomAndclassroomOffering}
                  </ComboboxOption>
                );
              })}
            </Combobox>
            <Box marginTop={2}>
              {hasGroupEnrollment === false ? (
                <Typography fontWeight="bold" textColor="danger500" as="h1">
                  This classroom and classroom offering do not support group
                  enrollments.
                </Typography>
              ) : null}
            </Box>
          </div>
          <TextInput
            disabled
            label="Role"
            placeholder="Admin"
            size="M"
            type="text"
          />
          <div>
            <NumberInput
              label="Select number seats"
              placeholder="Select number seats"
              value={numberOfSeats}
              onValueChange={(value) => {
                setNumberOfSeats(value);
              }}
              required
            />
            <Box marginTop={2}>
              {numberOfSeats < 2 ? (
                <Typography fontWeight="bold" textColor="danger500" as="h1">
                  Number of seats has to be a minimum of 2
                </Typography>
              ) : null}
            </Box>
          </div>
        </Flex>
        <Box marginTop={4}>
          {!userValue || !classroomValue ? (
            <Typography fontWeight="bold" textColor="danger500" as="h1">
              All fields are required
            </Typography>
          ) : null}
        </Box>
        <Box>{showSuccess && showSuccessMessage()}</Box>
        <Box>{showAllreadyAdded && showAllreadyAddedMessage()}</Box>
        <Box marginTop={8} background="neutral0">
          <Flex alignItems="center" justifyContent="end" width={100} gap={2}>
            <Button
              startIcon={<Plus />}
              variant="primary"
              size="L"
              onClick={handleClassroomEnrollment}
              disabled={!userValue || !classroomValue}
            >
              Save and New
            </Button>
            <Button
              variant="primary"
              size="L"
              onClick={() => {
                handleClassroomEnrollment();
                setShowModal(false);
              }}
              disabled={
                !userValue ||
                !classroomValue ||
                hasGroupEnrollment === false ||
                numberOfSeats < 2
              }
            >
              Save
            </Button>
          </Flex>
        </Box>
      </Box>
    </TabPanel>
  );
};

export default GroupTab;

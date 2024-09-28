import React, { useContext, useRef, useState } from "react";
import {
  Layout,
  BaseHeaderLayout,
  ContentLayout,
  Link,
  Button,
  Box,
  Flex,
  Tabs,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  BaseCheckbox,
  VisuallyHidden,
  Textarea,
  Popover,
} from "@strapi/design-system";
import { Select } from "@strapi/ui-primitives";
import { Typography } from "@strapi/design-system/Typography";
import { IconButton } from "@strapi/design-system/IconButton";
import { Plus, ArrowLeft, Pencil, Trash, CarretDown } from "@strapi/icons";
import { EnrollmentContext } from "../../pages/hook/enrollContext.js";

const ROW_COUNT = 6;
const COL_COUNT = 5;
const entry = {
  cover: "https://avatars.githubusercontent.com/u/3874873?v=4",
  description: "Chez Léon is a human sized Parisian",
  category: "French cuisine",
  contact: "Leon Lafrite",
};
const entries = Array.from({ length: ROW_COUNT }, (_, i) => ({
  ...entry,
  id: i + 1,
}));

const AddEnrollmentTable = () => {
  const { userEnrollmentToBeAdded, setUserEnrollmentToBeAdded } =
    useContext(EnrollmentContext);
  const [isClassroomListVisible, setIsClassroomListVisible] = useState(false);
  const [isCourseListVisible, setIsCourseListVisible] = useState(false);
  const buttonRefs = useRef([]);
  const courseButtonRefs = useRef([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleDelete = (index) => {
    const newEntries = [...userEnrollmentToBeAdded];
    newEntries.splice(index, 1);
    setUserEnrollmentToBeAdded(newEntries);
  };

  const countNumCourseOfferings = (entry) => {
    return Array.isArray(entry?.courseOfferings)
      ? entry?.courseOfferings.length
      : 0;
  };

  const countNumClassroomOfferings = (entry) => {
    return Array.isArray(entry?.classroomOfferings)
      ? entry?.classroomOfferings.length
      : 0;
  };

  const CourseClassroomList = ({ buttonRef, entry }) => {
    if (Array.isArray(entry?.classroomOfferings)) {
      return (
        <Popover
          onDismiss={() => {}}
          source={buttonRef}
          padding={1}
          spacing={4}
        >
          <Box width={17}>
            <ul>
              {entry?.classroomOfferings.map((classroomOffering, index) => (
                <li key={index} style={{ padding: "5px" }}>
                  <Typography variant="PI" textColor="neutral500">
                    {classroomOffering?.classroomAndclassroomOffering}
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        </Popover>
      );
    }
  };

  const CourseList = ({ buttonRef, entry }) => {
    if (Array.isArray(entry?.courseOfferings)) {
      return (
        <Popover
          onDismiss={() => {}}
          source={buttonRef}
          padding={1}
          spacing={4}
        >
          <Box width={17}>
            <ul>
              {entry?.courseOfferings.map((courseOffering, index) => (
                <li key={index} style={{ padding: "5px" }}>
                  <Typography variant="PI" textColor="neutral500">
                    {courseOffering?.courseOfferingTitle}
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        </Popover>
      );
    }
  };

  return (
    <Box color="neutral800" padding={2} background="neutral0">
      <Table>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">ID</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">User</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Courses</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Classrooms</Typography>
            </Th>
            <Th>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {Array.isArray(userEnrollmentToBeAdded) &&
            userEnrollmentToBeAdded.map((entry, index) => {
              const numberOfCourseOfferings = countNumCourseOfferings(entry);
              const numberOfClassrooms = countNumClassroomOfferings(entry);

              // If there is no ref for this index, create one
              if (!buttonRefs.current[index]) {
                buttonRefs.current[index] = React.createRef();
              }

              if (!courseButtonRefs.current[index]) {
                courseButtonRefs.current[index] = React.createRef();
              }

              return (
                <Tr key={index}>
                  <Td>
                    <Typography textColor="neutral800">
                      {entry?.userId}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography textColor="neutral800">
                      {entry?.userEmail}
                    </Typography>
                  </Td>
                  <Td>
                    <Button
                      variant="tertiary"
                      ref={courseButtonRefs.current[index]}
                      endIcon={<CarretDown />}
                      onClick={() => {
                        setSelectedCourse(index);
                        setIsCourseListVisible((prev) => !prev);
                      }}
                      size="S"
                    >
                      {numberOfCourseOfferings}{" "}
                      {numberOfCourseOfferings === 1 ? `Item` : `Items`}
                    </Button>
                    {isCourseListVisible &&
                      selectedCourse === index &&
                      numberOfCourseOfferings > 0 && (
                        <CourseList
                          buttonRef={courseButtonRefs.current[index]}
                          entry={entry}
                        />
                      )}
                  </Td>
                  <Td>
                    <Button
                      variant="tertiary"
                      ref={buttonRefs.current[index]}
                      endIcon={<CarretDown />}
                      onClick={() => {
                        setSelectedClassroom(index);
                        setIsClassroomListVisible((prev) => !prev);
                      }}
                      size="S"
                    >
                      {numberOfClassrooms}{" "}
                      {numberOfClassrooms === 1 ? `Item` : `Items`}
                    </Button>
                    {isClassroomListVisible &&
                      selectedClassroom === index &&
                      numberOfClassrooms > 0 && (
                        <CourseClassroomList
                          buttonRef={buttonRefs.current[index]}
                          entry={entry}
                        />
                      )}
                  </Td>
                  <Td>
                    <Flex>
                      <Box paddingLeft={1}>
                        <IconButton
                          onClick={() => handleDelete(index)}
                          label="Delete"
                          icon={<Trash fill="primary700" />}
                        />
                      </Box>
                    </Flex>
                  </Td>
                </Tr>
              );
            })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AddEnrollmentTable;

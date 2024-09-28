import React, { useState, useEffect, useContext } from "react";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  Flex,
  Combobox,
  ComboboxOption,
  Box,
  Tabs,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
} from "@strapi/design-system";
import CourseOfferingTab from "./CourseOfferingTab.js";
import ClassroomTab from "./classroomTab";
import GroupTab from "./GroupTab.js";
import userRequest from "../../api/users";
import courseOfferingRequest from "../../api/courseOffering";
import { EnrollmentContext } from "../../pages/hook/enrollContext";

export default function AddEnrollmentModal({ setShowModal }) {
  const [allUsers, setAllUsers] = useState([]);
  const [userStartIndex, setUserStartIndex] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const { setMainError, setErrorMessage } = useContext(EnrollmentContext);

  const findAllUsers = async () => {
    try {
      const response = await userRequest.findAll(userStartIndex);
      const { meta, data } = response;
      setAllUsers([...allUsers, ...data]);
      const { total } = meta.pagination;
      setUserTotal(total);
    } catch (error) {
      setMainError(true);
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    // find all users
    findAllUsers();
  }, []);

  return (
    <>
      <ModalLayout
        onClose={() => setShowModal(false)}
        labelledBy="title"
        as="form"
        onSubmit={() => {}}
      >
        <ModalHeader>
          <Typography
            fontWeight="bold"
            textColor="neutral800"
            as="h1"
            id="title"
          >
            Add enrollments to table
          </Typography>
        </ModalHeader>

        <ModalBody>
          <Box background="neutral0">
            <TabGroup
              label="Some stuff for the label"
              id="tabs"
              variant="simple"
            >
              <Tabs>
                <Tab>Add Course Offering</Tab>
                <Tab>Add Classroom</Tab>
                <Tab>Add New Group</Tab>
              </Tabs>
              <TabPanels>
                {/* Course tab */}
                <CourseOfferingTab
                  allUsers={allUsers}
                  setUserStartIndex={setUserStartIndex}
                  userTotal={userTotal}
                  setShowModal={setShowModal}
                />
                {/* Classroom tab */}
                <ClassroomTab allUsers={allUsers} setShowModal={setShowModal} />
                {/* Group tab */}
                <GroupTab allUsers={allUsers} setShowModal={setShowModal} />
              </TabPanels>
            </TabGroup>
          </Box>
        </ModalBody>
        {/* <ModalFooter
          startActions={
            <Button onClick={() => setShowModal(false)} variant="tertiary">
              Cancel
            </Button>
          }
          endActions={<Button type="submit">Add</Button>}
        /> */}
      </ModalLayout>
    </>
  );
}

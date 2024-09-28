/*
 *
 * HomePage
 *
 */

import React, { useState, useEffect, useContext } from "react";
// import PropTypes from 'prop-types';
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
  BaseCheckbox,
  Avatar,
  VisuallyHidden,
} from "@strapi/design-system";
import { Plus, ArrowLeft, Pencil, Trash } from "@strapi/icons";
import { Typography } from "@strapi/design-system/Typography";
import { IconButton } from "@strapi/design-system/IconButton";
import pluginId from "../../../pluginId";
import AddEnrollmentModal from "../../../components/AddEnrollmentModal";
import AddUserEnrollments from "./AddUserEnrollments";
import Notification from "../../../components/Notification";
import { EnrollmentContext } from "../../../../src/pages/hook/enrollContext.js";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [enrollmentEntries, setEnrollmentEntries] = useState([]);
  const {
    mainError,
    setMainError,
    errorMessage,
    mainSuccess,
    setMainSuccess,
    successMessage,
  } = useContext(EnrollmentContext);

  return (
    <Layout>
      {mainError && (
        <Notification
          showNotification={mainError}
          setShowNotification={setMainError}
          width="85%"
          message={errorMessage}
          variant="danger"
          title="Error"
        />
      )}
      {mainSuccess && (
        <Notification
          showNotification={mainSuccess}
          setShowNotification={setMainSuccess}
          width="85%"
          message={successMessage}
          variant="success"
          title="Success"
        />
      )}
      <BaseHeaderLayout
        title="Enrollments"
        subtitle="Dashboard for all enrollments"
        as="h2"
        primaryAction={
          <Button startIcon={<Plus />} onClick={() => setShowModal(true)}>
            Add
          </Button>
        }
      />
      <ContentLayout>
        <Box padding={1} background="primary100">
          <TabGroup
            label="Some stuff for the label"
            id="tabs"
            // onTabChange={(selected) => console.log(selected)}
          >
            <Tabs>
              <Tab>Add User Enrollments</Tab>
              <Tab disabled>Classroom Enrollments</Tab>
              <Tab disabled>Course Enrollments</Tab>
            </Tabs>
            <TabPanels>
              <TabPanel>
                <AddUserEnrollments />
              </TabPanel>
              <TabPanel>
                <Box color="neutral800" padding={4} background="neutral0">
                  Second panel
                </Box>
              </TabPanel>
              <TabPanel>
                <Box color="neutral800" padding={4} background="neutral0">
                  Third panel
                </Box>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Box>
      </ContentLayout>
      {showModal && <AddEnrollmentModal setShowModal={setShowModal} />}
    </Layout>
  );
};

export default Home;

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
import { Plus } from "@strapi/icons";
import { Typography } from "@strapi/design-system/Typography";

const Home = () => {
  const [currentEnvrionment, setCurrentEnvironment] = useState(
    process.env.NODE_ENV
  );

  useEffect(() => {
    console.log("currentEnvrionment::::", currentEnvrionment);
  }, [currentEnvrionment]);

  return (
    <Layout>
      {currentEnvrionment !== "development" ? (
        <Box padding={6} background="warning100">
          <Flex gap={2} alignItems="center">
            <VisuallyHidden>
              <Avatar size="small" />
            </VisuallyHidden>
            <Box>
              {/* <Typography as="h4" variant="body">
                You are in {currentEnvrionment} environment
              </Typography> */}
              <Typography as="p" variant="beta">
                This feature is only available in the development environment
              </Typography>
            </Box>
          </Flex>
        </Box>
      ) : (
        <>
          {/* {mainError && (
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
    )} */}
          <BaseHeaderLayout
            title="Languge Translations"
            subtitle="Dashboard for adding, updating and deleting texts for translations in production"
            as="h2"
            primaryAction={
              <Button startIcon={<Plus />} onClick={() => {}}>
                Add
              </Button>
            }
          />
          {/* <ContentLayout>
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
    </ContentLayout> */}
        </>
      )}
    </Layout>
  );
};

export default Home;

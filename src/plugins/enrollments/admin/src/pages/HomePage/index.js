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
import pluginId from "../../pluginId";
import AddEnrollmentModal from "../../components/AddEnrollmentModal";
import AddUserEnrollments from "./Tabs/AddUserEnrollments";
import Notification from "../../components/Notification";
import { EnrollmentContext } from "../../../src/pages/hook/enrollContext.js";
import Home from "./Tabs/index.js";

const HomePage = () => {
  const [userEnrollmentToBeAdded, setUserEnrollmentToBeAdded] = useState([
    // TODO: For testing purposes, remove this hard-coded data
    // {
    //   userEmail: "ljames@gmail.com",
    //   userId: 88,
    //   courseOfferings: [
    //     //padding
    //     { courseOfferingId: 1, courseOfferingTitle: "Course Offering 1" },
    //     { courseOfferingId: 2, courseOfferingTitle: "Course Offering 2" },
    //   ],
    //   classroomOfferings: [
    //     {
    //       classroomAndclassroomOffering:
    //         "Relational Discipleship Kickstart - On Demand",
    //       classroomOfferingId: 1,
    //       role: "Leaner",
    //       numberOfSeats: 10,
    //     },
    //     {
    //       classroomAndclassroomOffering:
    //         "Relational Discipleship Kickstart - Cohort 1",
    //       classroomOfferingId: 2,
    //       role: "Admin",
    //     },
    //   ],
    // },
    // {
    //   userEmail: "edem@gmail.com",
    //   userId: 88,
    //   courseOfferings: [
    //     { courseOfferingId: 1, courseOfferingTitle: "Course Offering 3" },
    //     { courseOfferingId: 2, courseOfferingTitle: "Course Offering 4" },
    //   ],
    //   classroomOfferings: [
    //     {
    //       classroomAndclassroomOffering:
    //         "Relational Discipleship Kickstart - Cohort 2",
    //       classroomOfferingId: 2,
    //       role: "Admin",
    //     },
    //   ],
    // },
    // {
    //   userEmail: "dumenu@gmail.com",
    //   userId: 88,
    //   classroomOfferings: [
    //     {
    //       classroomAndclassroomOffering:
    //         "Relational Discipleship Kickstart - On Demand",
    //       classroomOfferingId: 1,
    //       role: "Leaner",
    //     },
    //     {
    //       classroomAndclassroomOffering:
    //         "Relational Discipleship Kickstart - Cohort 3",
    //       classroomOfferingId: 2,
    //       role: "Admin",
    //     },
    //   ],
    // },
  ]);
  const [mainError, setMainError] = useState(false);
  const [mainSuccess, setMainSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const contextValue = {
    userEnrollmentToBeAdded,
    setUserEnrollmentToBeAdded,
    mainError,
    setMainError,
    errorMessage,
    setErrorMessage,
    mainSuccess,
    setMainSuccess,
    successMessage,
    setSuccessMessage,
  };

  return (
    <EnrollmentContext.Provider value={contextValue}>
      <Home />
    </EnrollmentContext.Provider>
  );
};

export default HomePage;

/*
 *
 * HomePage
 *
 */

import React, { useEffect } from "react";
// import PropTypes from 'prop-types';
import pluginId from "../../pluginId";
import Home from "./Tabs/index.js";
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

const HomePage = () => {
  const checkEnv = () => {
    console.log(process.env.NODE_ENV);
  };

  useEffect(() => {
    checkEnv();
  }, []);

  return (
    <div>
      <Home />
    </div>
  );
};

export default HomePage;

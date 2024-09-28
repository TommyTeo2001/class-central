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
  TextInput,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  CardCheckbox,
  CardAction,
  CardAsset,
  CardTimer,
  CardContent,
  CardBadge,
  CardTitle,
  CardSubtitle,
} from "@strapi/design-system";
import { getFetchClient } from "@strapi/helper-plugin";
import translationRequest from "../../api/translationRequest.js";
import { TranslationContext } from "../../../src/hooks/translationContext";

const TranslationModal = ({ setShowModal }) => {
  const [userValue, setUserValue] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [pageValue, setPageValue] = useState("Common");
  const [descriptionValue, setDescriptionValue] = useState("");

  const [translationFoundInTable, setTranslationFoundInTable] = useState(false);

  const [keyFound, setKeyFound] = useState({});
  const [textFound, setTextFound] = useState({});

  const {
    setMainError,
    setErrorMessage,
    translationsToBeAdded,
    setTranslationsToBeAdded,
  } = useContext(TranslationContext);

  const pages = [
    "Common",
    "HomePage",
    "ExplorePage",
    "CourseDetailsPage",
    "ClassroomDetailsPage",
    "MyLearningPage",
    "CourseViewPage",
    "ClassroomOfferingPage",
    "MyAccountPage",
  ];

  const clearAllFields = () => {
    setKeyValue("");
    setTextValue("");
    setPageValue("Common");
    setDescriptionValue("");
  };

  const checkIfTranslationKeyTextExists = async (saveType) => {
    setKeyFound({});
    setTextFound({});

    // Check if key or text exists in table
    const dataExist = checkIfKeyOrTextExistsInTable(keyValue, textValue);

    if (dataExist) {
      setTranslationFoundInTable(true);
      return;
    }

    setTranslationFoundInTable(false);

    try {
      const response = await translationRequest.checkDuplicateKeyOrText(
        keyValue,
        textValue
      );

      const data = await response.json();

      if (data.status !== 200) {
        setMainError(true);
        setErrorMessage(response.error);
        return;
      }

      const { keyFound, textFound } = data;
      if (Object.keys(keyFound).length > 0) {
        setKeyFound(keyFound);
        return;
      }

      if (Object.keys(textFound).length > 0) {
        setTextFound(textFound);
        return;
      }

      setTranslationsToBeAdded([
        ...translationsToBeAdded,
        {
          key: keyValue,
          text: textValue,
          description: descriptionValue,
          page: pageValue,
        },
      ]);

      if (saveType === "save") {
        setShowModal(false);
      }

      clearAllFields();
    } catch (error) {
      setMainError(true);
      setErrorMessage(
        "Error checking duplicate key or text failed. Please contact admin"
      );
    }

    return;
  };

  const checkIfKeyOrTextExistsInTable = (key, text) => {
    // Check if key or text exists in translationsToBeAdded
    const keyFound =
      translationsToBeAdded.length > 0 &&
      translationsToBeAdded.find((translation) => translation.key === key);

    const textFound =
      translationsToBeAdded.length > 0 &&
      translationsToBeAdded.find((translation) => translation.text === text);

    return !!keyFound || !!textFound;
  };

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
            fontSize="24px"
            id="title"
            as="h2"
            lineHeight="32px"
          >
            Add Translation
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Box color="neutral800" padding={4} background="neutral0">
            <Flex direction="column" alignItems="stretch" gap={6}>
              <TextInput
                label="Key"
                placeholder="Key"
                size="M"
                type="text"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                required
              />
              {Object.keys(keyFound).length > 0 && (
                <Card
                  style={{
                    width: "100%",
                  }}
                  background="primary200"
                >
                  <CardBody>
                    <CardContent>
                      <CardTitle>Record Id: {keyFound.id}</CardTitle>
                      <CardSubtitle>
                        Key: {keyFound.attributes.key}
                      </CardSubtitle>
                      <CardSubtitle>
                        Text: {keyFound.attributes.text}
                      </CardSubtitle>
                      <CardSubtitle>
                        Locale: {keyFound.attributes.locale}
                      </CardSubtitle>
                      <CardSubtitle>
                        Page: {keyFound.attributes.page}
                      </CardSubtitle>
                    </CardContent>
                    <CardBadge background="danger500" textColor="neutral800">
                      Duplicate key found in production
                    </CardBadge>
                  </CardBody>
                </Card>
              )}
              <Textarea
                label="Text"
                placeholder="Text"
                name="content"
                value={textValue}
                required
                onChange={(e) => setTextValue(e.target.value)}
              />
              {Object.keys(textFound).length > 0 && (
                <Card
                  style={{
                    width: "100%",
                  }}
                  background="primary200"
                >
                  <CardBody>
                    <CardContent>
                      <CardTitle>Record Id: {textFound.id}</CardTitle>
                      <CardSubtitle>
                        Key: {textFound.attributes.key}
                      </CardSubtitle>
                      <CardSubtitle>
                        Text: {textFound.attributes.text}
                      </CardSubtitle>
                      <CardSubtitle>
                        Locale: {textFound.attributes.locale}
                      </CardSubtitle>
                      <CardSubtitle>
                        Page: {textFound.attributes.page}
                      </CardSubtitle>
                    </CardContent>
                    <CardBadge background="danger500" textColor="neutral800">
                      Duplicate text found in production
                    </CardBadge>
                  </CardBody>
                </Card>
              )}
              <Textarea
                label="Description"
                placeholder="Description"
                name="content"
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
              />
              <Combobox
                placeholder="Page"
                label="Page"
                onChange={() => {}}
                value={pageValue}
                onChange={setPageValue}
                onClear={() => setPageValue("")}
                required
              >
                {pages.map((page, index) => {
                  return (
                    <ComboboxOption key={index} value={page}>
                      {page}
                    </ComboboxOption>
                  );
                })}
              </Combobox>
              {translationFoundInTable && (
                <Typography
                  fontWeight="bold"
                  fontSize="24px"
                  id="title"
                  as="h2"
                  lineHeight="32px"
                  textColor="danger500"
                >
                  Translation already exist in the current table
                </Typography>
              )}
            </Flex>
            <Flex justifyContent="end" paddingTop={6} gap={1}>
              <Button
                variant="primary"
                onClick={() => {
                  checkIfTranslationKeyTextExists("save");
                }}
                disabled={!keyValue || !textValue || !pageValue}
              >
                Save
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  checkIfTranslationKeyTextExists("saveAndNew");
                }}
                disabled={!keyValue || !textValue || !pageValue}
              >
                Save and New
              </Button>
            </Flex>
          </Box>
        </ModalBody>
      </ModalLayout>
    </>
  );
};

export default TranslationModal;

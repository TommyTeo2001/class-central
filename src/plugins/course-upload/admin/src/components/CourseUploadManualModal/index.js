import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  Flex,
  Combobox,
  ComboboxOption,
  CreatableCombobox,
  Box,
  ToggleInput,
  Icon,
  Textarea,
} from "@strapi/design-system";
import { ExclamationMarkCircle } from "@strapi/icons";
import { Plus, ArrowLeft, Pencil } from "@strapi/icons";
import courseUploadRequest from "../../api/courseupload";
import {
  xAPIScript,
  hotJarScript,
  missionControlScript,
  xAPIBookMarkScript,
  xAPIScriptFunction,
} from "../../constants/general";

export default function CourseUploadManualModal({
  setShowManualModal,
  selectedCourseManualUpload,
  setShowModal,
  createCourseUploadCollection,
}) {
  const [courseUrl, setCourseUrl] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(false);

  const handleSubmit = async (e) => {
    // Prevent submitting parent form
    e.preventDefault();
    e.stopPropagation();
    setSubmitAttempt(true);
    if (courseUrl === null || courseUrl === "") {
      return;
    }
    setLoading(true);
    const courseUploadUrl = courseUrl;
    const folderNameAWS = selectedCourseManualUpload.folderNameAWS;
    const courseName = selectedCourseManualUpload.courseName;
    const courseId = selectedCourseManualUpload.courseId;
    createCourseUploadCollection({
      courseUploadUrl,
      folderNameAWS,
      courseName,
      courseId,
    });
    setShowManualModal(false);
  };

  return (
    <ModalLayout
      onClose={() => setShowManualModal(false)}
      labelledBy="title"
      as="form"
      onSubmit={handleSubmit}
    >
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h1" id="title">
          Instruction for manual upload
        </Typography>
      </ModalHeader>

      <ModalBody>
        <Flex direction="column" alignItems="stretch" gap={6}>
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={4}
          >
            <Box>
              <Icon
                width={`3rem`}
                height={`3rem`}
                color="warning600"
                as={ExclamationMarkCircle}
              />
            </Box>
          </Flex>
          <Box>
            <Typography
              fontWeight="bold"
              textColor="neutral800"
              as="h1"
              variant="beta"
            >
              You either selected custom upload or the course folder you tried
              uploading is more than 30mb, Follow the steps below:
            </Typography>
            <Typography
              fontWeight="bold"
              textColor="neutral800"
              as="h1"
              variant="delta"
              style={{ marginTop: "40px" }}
            >
              1. Open the folder on your computer and select the 'lib' folder
              inside the articulate folder. Once in the folder, right click on
              the lms.js file in a text editor (Notepad is recommended for
              Windows users, Visual Studio Code is recommended for Mac users. Do
              NOT open with MS Word or any other word processor)
            </Typography>
            <Typography
              fontWeight="bold"
              textColor="neutral1000"
              as="h1"
              variant="delta"
              style={{ marginTop: "40px" }}
            >
              {`2. Navigate down to "var PROGRESSED = 'http://adlnet.gov/expapi/verbs/progressed';" which is usually on line #41 (it may be on a different line number), create a new line right under it and copy this code onto this line.`}
            </Typography>
            <Textarea
              name="content"
              hint="xAPI tracking function code"
              style={{ height: "27rem", padding: "0" }}
              disabled
            >
              {xAPIScriptFunction}
            </Textarea>
            <Typography
              fontWeight="bold"
              textColor="neutral1000"
              as="h1"
              variant="delta"
              style={{ marginTop: "40px" }}
            >
              {`3. Navigate down to where you'll see "function sendStatement(attribs) {" which should be between line #156 - #162, create a new line right under it and copy this code onto this line.`}
            </Typography>
            <Textarea
              name="content"
              hint="xAPI tracking code"
              style={{ height: "7rem", padding: "0" }}
              disabled
            >
              {xAPIScript}
            </Textarea>
            <Typography
              fontWeight="bold"
              textColor="neutral1000"
              as="h1"
              variant="delta"
              style={{ marginTop: "40px" }}
            >
              {`4. Navigate further down to where you'll see "function SetBookmark(data) {" which should be between line #314 - #319 , create a new line right under it and copy this code onto this line.`}
            </Typography>
            <Textarea
              name="content"
              hint="xAPI tracking code"
              style={{ height: "7rem", padding: "0" }}
              disabled
            >
              {xAPIBookMarkScript}
            </Textarea>
            <Typography
              fontWeight="bold"
              textColor="neutral1000"
              as="h1"
              variant="delta"
              style={{ marginTop: "40px" }}
            >
              {`5. Go back to the root of the folder and right click on the index.html file into the same text editor. Create a new line right under the <head> tag and copy this code into this line.`}
            </Typography>
            <Textarea
              name="content"
              hint="Hotjar tracking code"
              style={{ height: "17rem", padding: "0" }}
              disabled
            >
              {hotJarScript}
            </Textarea>
            <Typography
              fontWeight="bold"
              textColor="neutral1000"
              as="h1"
              variant="delta"
              style={{ marginTop: "40px" }}
            >
              {`6. Create a new line right under the Hotjar tracking code above and copy this code into this line.`}
            </Typography>
            <Textarea
              name="content"
              hint="Mission control code"
              style={{ height: "7rem", padding: "0" }}
              disabled
            >
              {missionControlScript}
            </Textarea>
            <Typography
              fontWeight="bold"
              textColor="neutral1000"
              as="h1"
              variant="delta"
              style={{ marginTop: "40px" }}
            >
              {`7. Copy any remaining scripts you may have into the index.html, save it and then upload the entire folder to the s3 bucket.`}
            </Typography>
            <Typography
              fontWeight="bold"
              textColor="neutral1000"
              as="h3"
              variant="delta"
              style={{ marginTop: "40px" }}
            >
              {`8. Now you can go to our s3 buckbet and upload the folder into this location: 'myFullerEquipClassroom/courses/'.  After uploading the folder, come back here and add the course url to the field right below to complete the course upload process. The course url should be the path to the index.html file in the s3 bucket, for eg:`}
            </Typography>
            {/* TODO: This is subject to change */}
            <Typography
              fontWeight="bold"
              textColor="secondary500"
              as="h1"
              variant="omega"
            >
              {`https://fullerequipawsbucket.s3.us-west-1.amazonaws.com/myFullerEquipClassroom/courses/deep-dive-embracing-my-purpose/index.html`}
            </Typography>
          </Box>
          <Box>
            <TextInput
              placeholder="This is a content placeholder"
              label="Course upload url"
              name="url"
              onChange={(e) => {
                setCourseUrl(e.target.value);
              }}
              error={
                submitAttempt && !courseUrl ? "Course URl cannot be empty" : ""
              }
              hint="hint: https://fullerequipawsbucket.s3.us-west-1.amazonaws.com/myFullerEquipClassroom/courses/deep-dive-embracing-my-purpose/index.html"
            />
          </Box>
          <Box>
            <Flex justifyContent="start" style={{ width: "100%" }} gap={10}>
              <TextInput
                label="Course name"
                name="url"
                value={selectedCourseManualUpload?.courseName}
                disabled
                style={{ width: "20rem" }}
              />
              <TextInput
                label="Folder name in AWS"
                name="url"
                hint="hint: this is the folder you renameed on your local computer"
                value={selectedCourseManualUpload?.folderNameAWS}
                style={{ width: "24rem" }}
              />
            </Flex>
          </Box>
          <Flex direction="row" alignItems="stretch" gap={1}></Flex>
          {validationError && (
            <Typography
              fontWeight="bold"
              textColor="danger500"
              as="h2"
              id="validationError"
            >
              Error: {validationError}
            </Typography>
          )}
        </Flex>
      </ModalBody>
      <ModalFooter
        startActions={
          <Button
            onClick={() => {
              setShowManualModal(false);
              setShowModal(true);
            }}
            variant="tertiary"
          >
            Back
          </Button>
        }
        endActions={<Button type="submit">Upload</Button>}
      />
    </ModalLayout>
  );
}

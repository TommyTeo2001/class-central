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
} from "@strapi/design-system";
import courseUploadRequest from "../../api/courseupload";

export default function CourseUploadManualModal({
  setShowModal,
  addCourseUpload,
  courseUploadsData,
  setShowManualModal,
  setSelectedCourseManualUpload,
}) {
  const [selectedCourse, setSeletedCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [formInfoData, setFormInfoData] = useState(null);
  const [disabled, setToggleDisabled] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [withXApiTracking, setWithXApiTracking] = useState(false);
  const [withHotJarTracking, setWithHotJarTracking] = useState(false);
  const [withMissionControl, setWithMissionControl] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(false);
  const [filesTotalSize, setFilesTotalSize] = useState(0);
  const [folderNameAWS, setFolderNameAWS] = useState("");
  const [hasIndexHtmlFile, setHasIndexHtmlFile] = useState(false);
  const [hasLMSFile, setHasLMSFile] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [selectedCourse]);

  // const handleFileChange = (e) => {
  //   const files = e.target.files;
  //   if (!files.length) {
  //     setValidationError("Please select a file to upload");
  //     setFormInfoData(null);
  //     return;
  //   }
  //   setValidationError("");
  //   const formData = new FormData();
  //   let filesTotalSize = 0;
  //   let hasIndexHtmlFile = false;
  //   Object.keys(files).forEach((file, index) => {
  //     filesTotalSize += files[file].size;
  //     if (files[file].name.match(/index\.html/i)) {
  //       setHasIndexHtmlFile(true);
  //     }
  //     if (files[file].name.match(/lms\.js/i)) {
  //       setHasLMSFile(true);
  //     }
  //     formData.append("multiFiles", files[file]);
  //   });
  //   formData.append("folderNameAWS", files[0].webkitRelativePath.split("/")[0]);
  //   formData.append("withXApiTracking", withXApiTracking);
  //   formData.append("withHotJarTracking", withHotJarTracking);
  //   formData.append("withMissionControl", withMissionControl);
  //   setFolderNameAWS(files[0].webkitRelativePath.split("/")[0]);
  //   setFilesTotalSize(filesTotalSize);
  //   setFormInfoData(formData);
  // };

  // const handleSubmit = async (e) => {
  //   // Prevent submitting parent form
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setSubmitAttempt(true);
  //   setLoading(true);
  //   if (!selectedCourse || !formInfoData) {
  //     setValidationError("Please select a course and zip file");
  //     return;
  //   }
  //   // Check if index.html file exists
  //   if (!hasIndexHtmlFile) {
  //     setValidationError(
  //       "There was a problem uploading articulate course. The folder does not contain an index.html file."
  //     );
  //     return;
  //   }
  //   // Check if lms.js file exists
  //   if (!hasLMSFile && withXApiTracking) {
  //     setValidationError(
  //       "You selected xAPI Tracking but there's no lms.js file in the folder. Please go to the root of the folder and search for '/lib/lms.js' to verify the file exist. Without this file, we cannot add xAPI tracking to this course."
  //     );
  //     return;
  //   }
  //   // Check if folder size is greater than 34mb
  //   const totalSizeInMB = Math.ceil(filesTotalSize / (1024 * 1024));
  //   if (totalSizeInMB > 34) {
  //     const courseName = selectedCourse?.attributes?.courseTitle;
  //     const courseId = selectedCourse?.id;
  //     setShowManualModal(true);
  //     setShowModal(false);
  //     setSelectedCourseManualUpload({
  //       courseName,
  //       courseId,
  //       folderNameAWS,
  //     });
  //     return;
  //   }

  //   setValidationError("");
  //   addCourseUpload(selectedCourse, formInfoData, folderNameAWS);
  //   setShowModal(false);
  // };

  const fetchCourses = async () => {
    const response = await fetch("/api/courses", {
      method: "GET",
    });
    const { data } = await response.json();
    setAllCourses(data);
  };

  const courseUploadExist = (courseId) => {
    return courseUploadsData.some(
      (courseUpload) => courseUpload.courseId === courseId
    );
  };

  return (
    <ModalLayout
      onClose={() => setShowModal(false)}
      labelledBy="title"
      as="form"
      onSubmit={handleSubmit}
    >
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h1" id="title">
          Add Articulate Course
        </Typography>
      </ModalHeader>

      <ModalBody>
        <Flex direction="column" alignItems="stretch" gap={7}>
          <Combobox
            placeholder="Course"
            label="Select a Course"
            value={selectedCourse?.attributes?.courseTitle}
            onChange={setSeletedCourse}
            onClear={() => setSeletedCourse(null)}
            error={!selectedCourse && submitAttempt}
            required
          >
            {allCourses.map((course) => {
              if (!courseUploadExist(course.id)) {
                return (
                  <ComboboxOption key={course.id} value={course}>
                    {course?.attributes?.courseTitle}
                  </ComboboxOption>
                );
              }
            })}
          </Combobox>
          <Flex direction="row" alignItems="center" gap={10} width={100}>
            <ToggleInput
              label="xAPI Tracking"
              onLabel="Add"
              offLabel="Don't Add"
              hint="Add xAPI tracking to the lms.js file in the uploaded course folder"
              disabled={!selectedCourse}
              onChange={(e) => setWithXApiTracking(e.target.checked)}
            />
            <ToggleInput
              label="Hotjar Tracking"
              onLabel="Add"
              offLabel="Don't Add"
              hint="Added Hotjar tracking to the index.html file in the uploaded course folder"
              disabled={!selectedCourse}
              onChange={(e) => setWithHotJarTracking(e.target.checked)}
            />
          </Flex>
          <Flex direction="row" alignItems="center" gap={10} width={100}>
            <ToggleInput
              label="Mission control Tracking"
              onLabel="Add"
              offLabel="Don't Add"
              hint="Add Mission control tracking to the index.html file in the uploaded course folder"
              disabled={!selectedCourse}
              onChange={(e) => setWithMissionControl(e.target.checked)}
            />
          </Flex>
          <Flex direction="row" alignItems="stretch" gap={1}>
            <label htmlFor="myfile" style={{ color: "#495057" }}>
              <Typography
                fontWeight="bold"
                textColor="neutral800"
                as="h2"
                id="title"
              >
                Select a zipped articulate folder:
              </Typography>
            </label>
            {/* <input
              onChange={handleFileChange}
              type="file"
              id="folderInput"
              name="folder"
              directory=""
              webkitdirectory=""
              style={{ color: "#495057", marginLeft: "1rem" }}
            /> */}
            <input
              onChange={handleFileChange}
              type="file"
              id="folderInput"
              name="folder"
              style={{ color: "#495057", marginLeft: "1rem" }}
            />
          </Flex>
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
          <Flex>
            <Typography style={{ marginRight: "1rem" }}>
              If you want to upload the course manually onto the s3 bucket,
              select a course and click here:
            </Typography>
            <Button
              onClick={() => {
                const courseName = selectedCourse?.attributes?.courseTitle;
                const courseId = selectedCourse?.id;
                setSelectedCourseManualUpload({
                  courseName,
                  courseId,
                  folderNameAWS,
                });
                setShowManualModal(true);
                setShowModal(false);
              }}
              variant="secondary"
              disabled={!selectedCourse}
            >
              Manual Upload
            </Button>
          </Flex>
          <Box>
            <Typography fontWeight="bold" textColor="neutral600" as="h1">
              Note:
            </Typography>
            <Typography fontWeight="bold" textColor="neutral600" as="h1">
              - After uploading the articulate course, please verify the link
              works and all the pages are loading correctly.
            </Typography>
            <Typography fontWeight="bold" textColor="neutral600" as="h1">
              - An Articulate folder may contain hundreds of files, so it may
              take a few seconds to upload onto our servers.
            </Typography>
          </Box>
        </Flex>
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={() => setShowModal(false)} variant="tertiary">
            Cancel
          </Button>
        }
        endActions={<Button type="submit">Upload</Button>}
      />
    </ModalLayout>
  );
}

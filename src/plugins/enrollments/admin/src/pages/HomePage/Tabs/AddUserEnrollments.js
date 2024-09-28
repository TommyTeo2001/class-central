import React, { useEffect, useState, useContext } from "react";
import AddEnrollmentTable from "../../../components/AddEnrollmentTable";
import { EnrollmentContext } from "../../hook/enrollContext";
import { Box, Button, Flex, Loader } from "@strapi/design-system";
import { Plus } from "@strapi/icons";
import AddEnrollConfirmationModal from "../../../components/AddEnrollConfirmationModal";
import enrollmentRequest from "../../../api/enrollments.js";
import jobRequest from "../../../api/job.js";
const AddUserEnrollments = ({}) => {
  const {
    userEnrollmentToBeAdded,
    setUserEnrollmentToBeAdded,
    setMainError,
    setErrorMessage,
    setMainSuccess,
    setSuccessMessage,
  } = useContext(EnrollmentContext);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [jobIds, setJobIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  let fetchJobCounter = 0;

  // Enroll user/s into course offering/s and classroom offering/s
  const enrollUser = async () => {
    setIsLoading(true);
    try {
      const response = await enrollmentRequest.enrollAllUsers(
        userEnrollmentToBeAdded
      );
      // Get jobIds from response
      const jobIds = response.map((job) => job.jobId);
      setJobIds(jobIds);
      fetchJobs(jobIds);
    } catch (error) {
      setShowConfirmationModal(false);
      setMainError(true);
      setErrorMessage(`There was an error creating a job. ${error.message}`);
    }
  };

  const fetchJobs = async (jobIds) => {
    try {
      const response = await jobRequest.findJobsByIds(jobIds);
      const completedJobs = response.filter(
        (job) => job.status === "Completed ✅"
      );

      fetchJobCounter++;
      if (completedJobs.length === jobIds.length) {
        setIsLoading(false);
        setUserEnrollmentToBeAdded([]);
        setJobIds([]);
        setMainSuccess(true);
        setSuccessMessage("User enrollments were successful.");
        setShowConfirmationModal(false);
      } else {
        // If all jobs are not completed, fetch jobs again
        if (fetchJobCounter <= jobIds.length * 2) {
          setTimeout(() => {
            fetchJobs(jobIds);
          }, 2000);
        } else {
          setIsLoading(false);
          setMainError(true);
          setErrorMessage(
            "There was an error with user enrollments. Please contact support."
          );
          setShowConfirmationModal(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
      setMainError(true);
      setErrorMessage(
        "There was an error with user enrollments. Please contact support."
      );
      setShowConfirmationModal(false);
    }
  };

  return (
    <Box color="neutral800" padding={2} background="neutral0">
      <AddEnrollmentTable />
      <Box marginTop={8} background="neutral0">
        <Flex alignItems="center" justifyContent="end" width={100}>
          <Button
            startIcon={<Plus />}
            variant="primary"
            size="L"
            onClick={() => setShowConfirmationModal(true)}
            disabled={userEnrollmentToBeAdded.length < 1}
          >
            Enroll
          </Button>
        </Flex>
      </Box>
      {showConfirmationModal && (
        <AddEnrollConfirmationModal
          setShowConfirmationModal={setShowConfirmationModal}
          enrollUser={enrollUser}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
};

export default AddUserEnrollments;

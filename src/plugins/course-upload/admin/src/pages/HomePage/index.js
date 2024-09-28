import React, { memo, useState, useEffect } from "react";
import pluginId from "../../pluginId";
import {
  Layout,
  BaseHeaderLayout,
  ContentLayout,
  Link,
  Button,
  Box,
  Flex,
} from "@strapi/design-system";
import { EmptyStateLayout } from "@strapi/design-system/EmptyStateLayout";
import { Illo } from "../../components/Illo";
import { Plus, ArrowLeft, Pencil } from "@strapi/icons";
import CourseUploadModal from "../../components/CourseUploadModal";
import CourseUploadManualModal from "../../components/CourseUploadManualModal";
import courseUploadRequest from "../../api/courseupload";
import CourseUploadCount from "../../components/CourseUploadCount";
import CourseUploadTable from "../../components/CourseUploadTable";
import Notification from "../../components/Notification";
import { LoadingIndicatorPage } from "@strapi/helper-plugin";
import ConfirmationModal from "../../components/ConfirmationModal";

const HomePage = () => {
  const [courseUploadsData, setCourseUploadsData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourseManualUpload, setSelectedCourseManualUpload] =
    useState(null);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteCourseUploadFolderName, setDeleteCourseUploadFolderName] =
    useState({});

  const findCourseUploads = async () => {
    setIsLoading(true);
    try {
      const response = await courseUploadRequest.find();
      setCourseUploadsData(response);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(
        "Something went wrong fetching course upload. Please try again later."
      );
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const createCourseUploadCollection = async (data) => {
    courseUploadRequest
      .create(data)
      .then((response) => {
        setSuccess(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setErrorMessage("Something went wrong. Please try again later.");
        setError(true);
      })
      .finally(() => {
        setIsLoading(false);
        findCourseUploads();
      });
  };

  const addCourseUpload = async (course, data, folderNameAWS) => {
    const courseName = course?.attributes?.courseTitle;
    const courseId = course?.id;
    setIsLoading(true);

    courseUploadRequest
      .createArticulateCourse(data)
      .then((r) => r.json())
      .then((response) => {
        if (response?.status === 200) {
          const {
            data: { courseUploadUrl },
          } = response;
          createCourseUploadCollection({
            courseUploadUrl,
            folderNameAWS,
            courseName,
            courseId,
          });
          return;
        }
        setIsLoading(false);
        setErrorMessage(
          response?.error?.message ||
            "Something went wrong uploading courses. Please try again later."
        );
        setError(true);
      })
      .catch((error) => {
        setIsLoading(false);
        // Handle error
        setErrorMessage(
          "Something went wrong uploading courses.. Please try again later.."
        );
        setError(true);
      });
  };

  const deleteCourseUpload = async () => {
    setIsLoading(true);
    courseUploadRequest
      .delete(
        deleteCourseUploadFolderName?.folderNameAWS,
        deleteCourseUploadFolderName?.courseUploadId
      )
      .then((response) => {
        if (!!response?.id) {
          setSuccess(true);
          return;
        }
        setErrorMessage(
          response?.error?.message ||
            "Something went wrong uploading courses. Please try again later."
        );
        setError(true);
      })
      .catch((error) => {
        setIsLoading(false);
        setErrorMessage(
          "Something went wrong uploading courses. Please try again later."
        );
        setError(true);
      })
      .finally(() => {
        setDeleteConfirmation(false);
        setIsLoading(false);
        findCourseUploads();
        setDeleteCourseUploadFolderName({});
      });
  };

  useEffect(() => {
    findCourseUploads();
  }, []);

  if (isLoading) return <LoadingIndicatorPage />;

  return (
    <Layout>
      {error && (
        <Notification
          showNotification={error}
          setShowNotification={setError}
          width="85%"
          message={errorMessage}
          variant="danger"
          title="Error"
        />
      )}
      {success && (
        <Notification
          showNotification={success}
          setShowNotification={setSuccess}
          width="85%"
          message="Successfully request"
          variant="success"
          title="Success: "
        />
      )}
      {deleteConfirmation && (
        <ConfirmationModal
          isVisible={deleteConfirmation}
          setIsVisible={setDeleteConfirmation}
          confirmAction={deleteCourseUpload}
          courseName={deleteCourseUploadFolderName?.courseName}
        />
      )}
      <BaseHeaderLayout
        navigationAction={
          <Link startIcon={<ArrowLeft />} to="/">
            Go back
          </Link>
        }
        // primaryAction={
        //   <Button startIcon={<Plus />} onClick={() => setShowModal(true)}>
        //     Add
        //   </Button>
        // }
        title="Course Upload"
        subtitle="Upload articulate course for each Course."
        as="h2"
      />
      <ContentLayout>
        {courseUploadsData.length === 0 ? (
          <EmptyStateLayout
            icon={<Illo />}
            // content="You don't have any articulate course yet..."
            content="This feature has been disabled for now"
            // action={
            //   <Button
            //     onClick={() => setShowModal(true)}
            //     variant="secondary"
            //     startIcon={<Plus />}
            //   >
            //     Add your first articulate course
            //   </Button>
            // }
          />
        ) : (
          <>
            <CourseUploadCount count={courseUploadsData.length} />
            <CourseUploadTable
              courseUploadsData={courseUploadsData}
              setShowModal={setShowModal}
              setDeleteConfirmation={setDeleteConfirmation}
              setDeleteCourseUploadFolderName={setDeleteCourseUploadFolderName}
            />
          </>
        )}
      </ContentLayout>
      {showModal && (
        <CourseUploadModal
          setShowModal={setShowModal}
          addCourseUpload={addCourseUpload}
          courseUploadsData={courseUploadsData}
          setShowManualModal={setShowManualModal}
          setSelectedCourseManualUpload={setSelectedCourseManualUpload}
        />
      )}
      {showManualModal && (
        <CourseUploadManualModal
          setShowManualModal={setShowManualModal}
          selectedCourseManualUpload={selectedCourseManualUpload}
          setShowModal={setShowModal}
          createCourseUploadCollection={createCourseUploadCollection}
        />
      )}
    </Layout>
  );
};

export default HomePage;

import React, { useEffect } from "react";
import {
  Button,
  Typography,
  ModalLayout,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@strapi/design-system";

const ConfirmationModal = ({
  isVisible,
  setIsVisible,
  confirmAction,
  courseName,
}) => {
  return (
    <>
      {isVisible && (
        <ModalLayout
          onClose={() => setIsVisible((prev) => !prev)}
          labelledBy="title"
        >
          <ModalHeader>
            <Typography
              fontWeight="bold"
              textColor="neutral800"
              as="h2"
              id="title"
            >
              Confirmation
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Typography textColor="danger500" as="h2" id="title">
              {`Are you sure you want to delete `}
              <Typography textColor="danger500" fontWeight="bold">
                {courseName}
              </Typography>
              {` ${
                !courseName ? `this` : ``
              } folder upload? Deleting this course will remove it from the database and delete the course folder from our servers.`}
            </Typography>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button
                onClick={() => setIsVisible((prev) => !prev)}
                variant="tertiary"
              >
                Cancel
              </Button>
            }
            endActions={
              <>
                <Button variant="danger" onClick={confirmAction}>
                  Yes
                </Button>
              </>
            }
          />
        </ModalLayout>
      )}
    </>
  );
};

export default ConfirmationModal;

import {
  Flex,
  Box,
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  Loader,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@strapi/design-system";
import React from "react";
import { WarningCircle } from "@strapi/icons";

const AddEnrollConfirmationModal = ({
  setShowConfirmationModal,
  enrollUser,
  isLoading,
}) => {
  return (
    <Dialog title="Confirmation" isOpen={true}>
      <DialogBody>
        <Flex justifyContent="center" alignItems="center">
          {isLoading ? (
            <Box padding={2}>
              <Loader />
            </Box>
          ) : (
            <Box background="neutral0">
              <Typography
                fontWeight="bold"
                textColor="neutral800"
                as="h3"
                id="description"
              >
                Are you sure you want to enroll the Users in the enrollments
                table?
              </Typography>
            </Box>
          )}
        </Flex>
      </DialogBody>
      <DialogFooter
        startAction={
          <Button
            onClick={() => setShowConfirmationModal(false)}
            variant="tertiary"
          >
            No
          </Button>
        }
        endAction={<Button onClick={enrollUser}>Yes</Button>}
      />
    </Dialog>
  );
};

export default AddEnrollConfirmationModal;

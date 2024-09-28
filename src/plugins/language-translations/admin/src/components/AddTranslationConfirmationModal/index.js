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

const AddTranslationConfirmationModal = ({
  setShowConfirmationModal,
  addTranslation,
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
                Are you sure you want to add these translations?
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
        endAction={<Button onClick={() => addTranslation()}>Yes</Button>}
      />
    </Dialog>
  );
};

export default AddTranslationConfirmationModal;

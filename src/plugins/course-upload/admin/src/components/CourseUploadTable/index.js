import React, { useState } from "react";
import {
  Table,
  Thead,
  TFooter,
  Tbody,
  Tr,
  Td,
  Th,
} from "@strapi/design-system/Table";
import { Box } from "@strapi/design-system/Box";
import { Flex } from "@strapi/design-system/Flex";
import { Button } from "@strapi/design-system/Button";
import { Typography } from "@strapi/design-system/Typography";
import { IconButton } from "@strapi/design-system/IconButton";
import { VisuallyHidden } from "@strapi/design-system/VisuallyHidden";
import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
import { TextInput } from "@strapi/design-system/TextInput";
import Pencil from "@strapi/icons/Pencil";
import Trash from "@strapi/icons/Trash";
import Plus from "@strapi/icons/Plus";
import { format, parseISO } from "date-fns";

export default function CourseUploadTable({
  courseUploadsData,
  deleteCourseUpload,
  editCourseUpload,
  setShowModal,
  setDeleteConfirmation,
  setDeleteCourseUploadFolderName,
}) {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Box
      background="neutral0"
      hasRadius={true}
      shadow="filterShadow"
      padding={8}
      style={{ marginTop: "10px" }}
    >
      <Table colCount={7} rowCount={10}>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">ID</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Course name</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Course Upload Link</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">ETag</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Folder Name in AWS</Typography>
            </Th>

            <Th>
              <Typography variant="sigma">Created Date</Typography>
            </Th>

            <Th>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {courseUploadsData.map((courseUpload) => {
            return (
              <Tr key={courseUpload.id}>
                <td>
                  <Typography>{courseUpload.id}</Typography>
                </td>
                <td>
                  <Typography>{courseUpload.courseName}</Typography>
                </td>
                <td>
                  <Typography>{courseUpload.courseUploadUrl}</Typography>
                </td>
                <td>
                  <Typography>{courseUpload.eTag}</Typography>
                </td>
                <td>
                  <Typography>{courseUpload.folderNameAWS}</Typography>
                </td>
                <td>
                  <Typography>
                    {format(
                      parseISO(courseUpload.createdAt),
                      "MMMM dd yyyy"
                    ).toString()}
                  </Typography>
                </td>
                <td>
                  <Flex style={{ justifyContent: "end" }}>
                    {/* <IconButton
                      onClick={() => setShowModal(true)}
                      label="Edit"
                      noBorder
                      icon={<Pencil />}
                    /> */}

                    <Box paddingLeft={1}>
                      <IconButton
                        onClick={() => {
                          setDeleteConfirmation(true);
                          setDeleteCourseUploadFolderName({
                            folderNameAWS: courseUpload.folderNameAWS,
                            courseName: courseUpload.courseName,
                            courseUploadId: courseUpload.id,
                          });
                        }}
                        label="Delete"
                        noBorder
                        icon={<Trash />}
                      />
                    </Box>
                  </Flex>
                </td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}

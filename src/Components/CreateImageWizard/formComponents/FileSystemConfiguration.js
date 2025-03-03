import React, { useEffect, useRef, useState } from 'react';

import { FormSpy } from '@data-driven-forms/react-form-renderer';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import {
  Alert,
  Button,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import {
  HelpIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import styles from '@patternfly/react-styles/css/components/Table/table';
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { v4 as uuidv4 } from 'uuid';

import MountPoint from './MountPoint';
import SizeUnit from './SizeUnit';

import { UNIT_GIB } from '../../../constants';

const initialRow = {
  id: uuidv4(),
  mountpoint: '/',
  fstype: 'xfs',
  size: 10,
  unit: UNIT_GIB,
};

const FileSystemConfiguration = ({ ...props }) => {
  const { change, getState } = useFormApi();
  const { input } = useFieldApi(props);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [draggingToItemIndex, setDraggingToItemIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [itemOrder, setItemOrder] = useState([initialRow.id]);
  const [tempItemOrder, setTempItemOrder] = useState([]);
  const bodyref = useRef();
  const [rows, setRows] = useState([initialRow]);

  useEffect(() => {
    const fsc = getState()?.values?.['file-system-configuration'];
    if (!fsc) {
      return;
    }

    const newRows = [];
    const newOrder = [];
    fsc.map((r) => {
      const id = uuidv4();
      newRows.push({
        id,
        mountpoint: r.mountpoint,
        fstype: 'xfs',
        size: r.size,
        unit: r.unit,
      });
      newOrder.push(id);
    });
    setRows(newRows);
    setItemOrder(newOrder);
  }, []);

  const showErrors = () =>
    getState()?.values?.['file-system-config-show-errors'];

  useEffect(() => {
    change(
      input.name,
      itemOrder.map((r) => {
        for (const r2 of rows) {
          if (r2.id === r) {
            return {
              mountpoint: r2.mountpoint,
              size: r2.size,
              unit: r2.unit,
            };
          }
        }
      })
    );
  }, [rows, itemOrder]);

  const addRow = () => {
    const id = uuidv4();
    setRows(
      rows.concat([
        {
          id,
          mountpoint: '/home',
          fstype: 'xfs',
          size: 1,
          unit: UNIT_GIB,
        },
      ])
    );
    setItemOrder(itemOrder.concat([id]));
  };

  const removeRow = (id) => {
    const removeIndex = rows.map((e) => e.id).indexOf(id);
    const newRows = [...rows];
    newRows.splice(removeIndex, 1);

    const removeOrderIndex = itemOrder.indexOf(id);
    const newOrder = [...itemOrder];
    newOrder.splice(removeOrderIndex, 1);

    setRows(newRows);
    setItemOrder(newOrder);
  };

  const moveItem = (arr, i1, toIndex) => {
    const fromIndex = arr.indexOf(i1);
    if (fromIndex === toIndex) {
      return arr;
    }

    const temp = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, temp[0]);
    return arr;
  };

  const move = (itemOrder) => {
    const ulNode = bodyref.current;
    const nodes = Array.from(ulNode.children);
    if (nodes.map((node) => node.id).every((id, i) => id === itemOrder[i])) {
      return;
    }

    while (ulNode.firstChild) {
      ulNode.removeChild(ulNode.lastChild);
    }

    itemOrder.forEach((id) => {
      ulNode.appendChild(nodes.find((n) => n.id === id));
    });
  };

  const onDragOver = (evt) => {
    evt.preventDefault();

    const curListItem = evt.target.closest('tr');
    if (!curListItem || !bodyref.current.contains(curListItem)) {
      return null;
    }

    const dragId = curListItem.id;
    const newDraggingToItemIndex = Array.from(
      bodyref.current.children
    ).findIndex((item) => item.id === dragId);
    if (newDraggingToItemIndex !== draggingToItemIndex) {
      const tempItemOrder = moveItem(
        [...itemOrder],
        draggedItemId,
        newDraggingToItemIndex
      );
      move(tempItemOrder);
      setDraggingToItemIndex(newDraggingToItemIndex);
      setTempItemOrder(tempItemOrder);
    }
  };

  const isValidDrop = (evt) => {
    const ulRect = bodyref.current.getBoundingClientRect();
    return (
      evt.clientX > ulRect.x &&
      evt.clientX < ulRect.x + ulRect.width &&
      evt.clientY > ulRect.y &&
      evt.clientY < ulRect.y + ulRect.height
    );
  };

  const onDragLeave = (evt) => {
    if (!isValidDrop(evt)) {
      move(itemOrder);
      setDraggingToItemIndex(null);
    }
  };

  const onDrop = (evt) => {
    if (isValidDrop(evt)) {
      setItemOrder(tempItemOrder);
    }
  };

  const onDragStart = (evt) => {
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/plain', evt.currentTarget.id);
    evt.currentTarget.classList.add(styles.modifiers.ghostRow);
    evt.currentTarget.setAttribute('aria-pressed', 'true');
    setDraggedItemId(evt.currentTarget.id);
    setIsDragging(true);
  };

  const onDragEnd = (evt) => {
    evt.target.classList.remove(styles.modifiers.ghostRow);
    evt.target.setAttribute('aria-pressed', 'false');
    setDraggedItemId(null);
    setDraggingToItemIndex(null);
    setIsDragging(false);
  };

  const setMountpoint = (id, mp) => {
    const newRows = [...rows];
    for (let i = 0; i < newRows.length; i++) {
      if (newRows[i].id === id) {
        const newRow = { ...newRows[i] };
        newRow.mountpoint = mp;
        newRows.splice(i, 1, newRow);
        break;
      }
    }

    setRows(newRows);
  };

  const setSize = (id, s, u) => {
    const newRows = [...rows];
    for (let i = 0; i < newRows.length; i++) {
      if (newRows[i].id === id) {
        const newRow = { ...newRows[i] };
        newRow.size = s;
        newRow.unit = u;
        newRows.splice(i, 1, newRow);
        break;
      }
    }

    setRows(newRows);
  };

  return (
    <FormSpy>
      {() => (
        <>
          <TextContent>
            <Text component={TextVariants.h3}>Configure partitions</Text>
          </TextContent>
          {rows.length > 1 &&
            getState()?.errors?.['file-system-configuration']?.duplicates
              ?.length !== 0 &&
            showErrors() && (
              <Alert
                variant="danger"
                isInline
                title="Duplicate mount points: All mount points must be unique. Remove the duplicate or choose a new mount point."
                data-testid="fsc-warning"
              />
            )}
          {rows.length >= 1 &&
            getState()?.errors?.['file-system-configuration']?.root === false &&
            showErrors() && (
              <Alert
                variant="danger"
                isInline
                title="No root partition configured."
              />
            )}
          <TextContent>
            <Text>
              Create partitions for your image by defining mount points and
              minimum sizes. Image builder creates partitions with a logical
              volume (LVM) device type.
            </Text>
            <Text>
              The order of partitions may change when the image is installed in
              order to conform to best practices and ensure functionality.
              <br></br>
              <Button
                component="a"
                target="_blank"
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/installation_guide/sect-partitioning-naming-schemes-and-mount-points"
                className="pf-u-pl-0"
              >
                Partition naming schemes and mount points
              </Button>
            </Text>
          </TextContent>
          <TableComposable
            aria-label="File system table"
            className={isDragging && styles.modifiers.dragOver}
            variant="compact"
          >
            <Thead>
              <Tr>
                <Th />
                <Th>Mount point</Th>
                <Th>Type</Th>
                <Th>
                  Minimum size
                  <Popover
                    hasAutoWidth
                    bodyContent={
                      <TextContent>
                        <Text>
                          Image Builder may extend this size based on
                          requirements, selected packages, and configurations.
                        </Text>
                      </TextContent>
                    }
                  >
                    <Button
                      variant="plain"
                      aria-label="File system configuration info"
                      aria-describedby="file-system-configuration-info"
                      className="pf-c-form__group-label-help"
                    >
                      <HelpIcon />
                    </Button>
                  </Popover>
                </Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody
              ref={bodyref}
              onDragOver={onDragOver}
              onDrop={onDragOver}
              onDragLeave={onDragLeave}
              data-testid="file-system-configuration-tbody"
            >
              {rows.map((row, rowIndex) => (
                <Tr
                  key={rowIndex}
                  id={row.id}
                  draggable
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  onDragStart={onDragStart}
                >
                  <Td
                    draggableRow={{
                      id: `draggable-row-${row.id}`,
                    }}
                  />
                  <Td className="pf-m-width-30">
                    <MountPoint
                      key={row.id + '-mountpoint'}
                      mountpoint={row.mountpoint}
                      onChange={(mp) => setMountpoint(row.id, mp)}
                    />
                    {getState().errors['file-system-configuration']?.duplicates
                      .length !== 0 &&
                      getState().errors[
                        'file-system-configuration'
                      ]?.duplicates.indexOf(row.mountpoint) !== -1 &&
                      showErrors() && (
                        <Alert
                          variant="danger"
                          isInline
                          isPlain
                          title="Duplicate mount point."
                        />
                      )}
                  </Td>
                  <Td className="pf-m-width-20">
                    {/* always xfs */}
                    {row.fstype}
                  </Td>
                  <Td className="pf-m-width-30">
                    <SizeUnit
                      key={row.id + '-sizeunit'}
                      size={row.size}
                      unit={row.unit}
                      onChange={(s, u) => setSize(row.id, s, u)}
                    />
                  </Td>
                  <Td className="pf-m-width-10">
                    <Button
                      variant="link"
                      icon={<MinusCircleIcon />}
                      onClick={() => removeRow(row.id)}
                      data-testid="remove-mount-point"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
          <TextContent>
            <Button
              data-testid="file-system-add-partition"
              className="pf-u-text-align-left"
              variant="link"
              icon={<PlusCircleIcon />}
              onClick={addRow}
            >
              Add partition
            </Button>
          </TextContent>
        </>
      )}
    </FormSpy>
  );
};

export default FileSystemConfiguration;

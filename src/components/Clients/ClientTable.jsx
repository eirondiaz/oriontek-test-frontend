import { DeleteOutline, EditOutlined } from '@mui/icons-material'
import { Box, IconButton, Modal, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useSnackbar } from 'notistack'
import React, { useState, useEffect } from 'react'
import useAxios from '../../hooks/useAxios'
import { CustomConfirmDeleteDialog } from '../../shared/components/CustomConfirmDeleteDialog'
import { style } from '../../shared/ModalStyle'
import ClientForm from './ClientForm'

const ClientTable = ({ setOpenEditForm, openEditFrom, filter }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState({})
  const [refresh, setRefresh] = useState(false)
  const [isEditing, setEditing] = useState(false)

  const { enqueueSnackbar } = useSnackbar()

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'lastName', headerName: 'Last name', flex: 1 },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      sortable: false,
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <>
          <Tooltip title={'Editar'}>
            <IconButton
              onClick={() => {
                handleClickOpenEditForm(params?.row)
              }}
            >
              <EditOutlined color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title={'Eliminar'}>
            <IconButton
              onClick={() => {
                handleClickOpenDeleteDialog(params?.row)
              }}
            >
              <DeleteOutline color="error" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ]

  const handleClickOpenDeleteDialog = (row) => {
    setSelected(row)
    setOpen(true)
  }

  const handleClickOpenEditForm = (row) => {
    setSelected(row)
    setOpenEditForm(true)
    setEditing(true)
  }

  const handleClose = () => {
    setOpen(false)
    setOpenEditForm(false)
    setEditing(false)
    setSelected({})
  }

  const { data, loading, sendRequest } = useAxios({
    path: `/clients?search=${filter?.search || ''}`,
    method: 'GET',
    initValue: [],
  })

  const { sendRequest: onDelete } = useAxios({
    path: `/clients/${selected?.id}`,
    method: 'DELETE',
    finallyCB: () => handleClose(),
    catchCB: (errorMessage) => {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
      })
    },
    tryCB: () => {
      setRefresh((prevVal) => !prevVal)
      enqueueSnackbar('Deleted successfully!', {
        variant: 'success',
      })
    },
  })

  useEffect(() => {
    sendRequest()
  }, [refresh, filter?.search])

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        loading={loading}
        disableColumnMenu
        disableRowSelectionOnClick
        checkboxSelection
      />

      <Modal open={openEditFrom} onClose={handleClose}>
        <Box sx={style}>
          <ClientForm
            setRefresh={setRefresh}
            setIsEditing={setEditing}
            isEditing={isEditing}
            setOpen={setOpenEditForm}
            element={selected}
          />
        </Box>
      </Modal>

      <CustomConfirmDeleteDialog
        open={open}
        handleClose={handleClose}
        onDelete={onDelete}
        title={selected?.name}
      />
    </div>
  )
}

export default ClientTable

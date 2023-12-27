import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    GridRowModes,
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
    GridRowEditStopReasons,
} from '@mui/x-data-grid';

const updateOrderById = async (id, data) => {
    console.log('save: ', id, data)
    try {
        const res = await fetch(`http://localhost:3000/orders/api/${id}`, {
            cache: "no-store",
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json'
            }
        })
        return res;
    } catch (error) {
        console.log(error)
        return {ok: false, error: error.toString()}
    }
}

function EditToolbar(props) {
    const { orderId, rows, setRows, setRowModesModel, lastDetailId, setLastDetailId, edited, setEdited, cacheRows, setCacheRows} = props;

    const handleAddClick = () => {
        const id = lastDetailId + 1;
        setLastDetailId(id);

        setRows((oldRows) => [...oldRows, { id, name: '', isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    const handleSaveClick = () =>
    {
        const newRows = rows.map((row) => {
            return {name: row.name, size: row.size, count: row.count}
        })
        updateOrderById(orderId,{details: newRows})
            .then((res) => {
                if (res.ok) {
                    console.log('res: ', res)
                    setCacheRows(newRows)
                    setEdited(false)
                } else {
                    console.log('error:', res.status)
                }
            })
    }

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleAddClick}>
                Добавить позицию
            </Button>
            <Button sx={{display: !edited ? 'none' : ''}} color="error" startIcon={<DoDisturbIcon />}
                    onClick={() => {setRows(cacheRows); setEdited(false)}}>
                Отменить
            </Button>
            <Button sx={{display: !edited ? 'none' : ''}} color="success" startIcon={<SaveIcon />}
                    onClick={handleSaveClick}>
                Сохранить
            </Button>
        </GridToolbarContainer>
    );
}

export default function FullFeaturedCrudGrid(props) {
    const {orderId, rows, setRows, stockArray} = props
    const [rowModesModel, setRowModesModel] = React.useState({});
    const [lastDetailId, setLastDetailId] = React.useState(rows.length);
    const [cacheRows, setCacheRows] = React.useState(rows)
    const [edited, setEdited] = React.useState(false);

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        // console.log('setRowModesModel(handleEditClick)!');
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id) => () => {
        // console.log('rowModesModel: ', rowModesModel);
        // console.log('setRowModesModel(handleSaveClick)!');
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id) => () => {
        setEdited(true)
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id) => () => {
        // console.log('setRowModesModel(handleCancelClick)!');
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow, originalRow) => {
        setEdited(true)
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Наименование',
            width: 300,
            editable: true,
            type: 'singleSelect',
            valueOptions: stockArray,
        },
        {
            field: 'size',
            headerName: 'Размер',
            width: 150,
            editable: true,
        },
        {
            field: 'count',
            headerName: 'Количество',
            width: 150,
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: '',
            width: 100,
            cellClassName: 'actions',
            getActions: ({id}) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<CheckIcon/>}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon/>}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />
                ];
            },
        },
    ];

    return (
        <Box
            sx={{
                height: '100%',
                width: '106ch',
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
            }}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                disableRowSelectionOnClick
                slots={{
                    toolbar: EditToolbar,
                }}
                slotProps={{
                    toolbar: { orderId, rows, setRows, setRowModesModel, lastDetailId, setLastDetailId, edited, setEdited, cacheRows, setCacheRows },
                }}
            />
        </Box>
    );
}
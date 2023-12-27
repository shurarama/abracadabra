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

function getRowId(row) {
    return row.length;
}

const updateStockById = async (id, data) => {
    console.log('save: ', id, data)
    try {
        const res = await fetch(`http://localhost:3000/stock/api/${id}`, {
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
    const { id, rows, setRows, setRowModesModel, edited, setEdited, cacheRows, setCacheRows } = props;

    const handleClick = () => {
        const length = 0;
        
        setRows((oldRows) => [...oldRows, { length, size: 0, isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [length]: { mode: GridRowModes.Edit, fieldToFocus: 'length' },
        }));
    };

    const handleSaveClick = () =>
    {
        const newRows = rows.map((row) => {
            return {length: row.length, count: row.count}
        })
        updateStockById(id,{balance: newRows})
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
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
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
    const {id, rows, setRows} = props
    const [cacheRows, setCacheRows] = React.useState(rows)
    const [rowModesModel, setRowModesModel] = React.useState({});
    const [edited, setEdited] = React.useState(false);
    console.log(id)

    // console.log(test)

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (length) => () => {
        setRowModesModel({ ...rowModesModel, [length]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (length) => () => {
        setRowModesModel({ ...rowModesModel, [length]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (length) => () => {
        setEdited(true)
        setRows(rows.filter((row) => row.length !== length));
    };

    const handleCancelClick = (length) => () => {
        setRowModesModel({
            ...rowModesModel,
            [length]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.length === length);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.length !== length));
        }
    };

    const processRowUpdate = (newRow, originalRow) => {
        setEdited(true)
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.length === originalRow.length ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns = [
        {
            field: 'length',
            headerName: 'Length',
            width: 90,
            editable: true,

        },
        {
            field: 'count',
            headerName: 'Count',
            width: 150,
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: '',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<CheckIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
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
                getRowId={getRowId}
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
                    toolbar: { id, rows, setRows, setRowModesModel, edited, setEdited, cacheRows, setCacheRows },
                }}
            />
        </Box>
    );
}
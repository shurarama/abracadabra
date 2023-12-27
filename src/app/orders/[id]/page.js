'use client'

import * as React from 'react';
import Box from "@mui/material/Box";
import {CircularProgress, Modal, Stack, TextField} from "@mui/material";
import FullFeaturedCrudGrid from "@/app/orders/[id]/detailsViev";
import {useEffect, useState} from "react";
import Divider from "@mui/material/Divider";
import EditIcon from '@mui/icons-material/Edit';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import SaveIcon from '@mui/icons-material/Save';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ShowCutting from "@/app/orders/[id]/showCutting";


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
const calc = (setCalc, rows, handleOpen) => () => {
    fetch(`http://localhost:3000/orders/calc/api`, {
        cache: "no-store",
        method: 'POST',
        body: JSON.stringify(rows),
        headers: {
            'content-type': 'application/json'
        }
    })
        .then((res) => res.json())
        .then((calc) => {
            console.log('calc: ', calc);
            setCalc(calc);
            handleOpen();
        })
}
const updateOrderById = async (id, data) => {
    try {
        const res = await fetch(`http://localhost:3000/orders/api/${id}`, {
            cache: "no-store",
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json'
            }
        })
        console.log(res)
        if (res.ok) {
            console.log("Yeai!")
        } else {
            console.log("Oops! Something is wrong.")
        }
        return res;
    } catch (error) {
        console.log(error)
        return {ok: false, error: error};
    }
}

export default function OrderIdPage({ params }) {
    const {id} = params;
    const [data, setData] = useState(null)
    const [details, setDetails] = useState(null)
    const [edit, setEdit] = useState(false)
    const [isLoading, setLoading] = useState(true)
    const [isLoadingStock, setLoadingStock] = useState(true)
    const [isNew, setNew] = useState(false)
    const [stock, setStock] = useState([])
    const [cut, setCut] = useState();

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handlerDescriptionChange = (event) => {
        setData({...data, [event.target.id]: event.target.value});
    }

    useEffect(() => {
        if (id !== 'new') {
            fetch(`http://localhost:3000/orders/api/${id}`, {
                cache: "no-store",
            })
                .then((res) => res.json())
                .then((order) => {
                    console.log('order: ', order);
                    setData({
                        id: order.id,
                        name: order.name
                    })
                    let id = 0;
                    setDetails(order.details ? order.details.map((row) => ({...row, id: id++})) : [])
                    setLoading(false)
                })

            fetch(`http://localhost:3000/stock/api/`, {
                cache: "no-store",
            })
                .then((res) => res.json())
                .then((data) => {
                    setStock(data.stock.map((row) => row.name));
                    setLoadingStock(false);
                })
        } else {
            setData({
                id: 'new',
                name: ''
            });
            setDetails([])
            setLoading(false);
            setLoadingStock(false);
            setNew(true);
        }
    }, []);

    if (isLoading || isLoadingStock) return <CircularProgress />

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Раскрой
                    </Typography>
                    <Divider sx={{marginBottom: 2}}/>
                    <ShowCutting cuts={cut}/>
                </Box>
            </Modal>
            <Stack
                spacing={1}
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: '1ch', width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <Stack direction="row" sx={{margin: '1ch 1ch 2ch'}} spacing={1}>
                    <Button onClick={calc(setCut, details, handleOpen)} color="success">Расчет</Button>
                    <Button sx={{display: edit || isNew ? 'none' : ''}} variant="outlined" startIcon={<EditIcon />}
                            onClick={() => {setEdit(true)}}
                    >
                        Редактировать описание
                    </Button>
                    <Button sx={{display: !edit ? 'none' : ''}} variant="outlined" startIcon={<DoDisturbIcon />}
                            onClick={() => {setEdit(false)}} color="error"
                    >
                        Отменить
                    </Button>
                    <Button sx={{display: !edit && !isNew ? 'none' : ''}} variant="outlined" startIcon={<SaveIcon />}
                            onClick={() => {
                                setEdit(false)
                                updateOrderById(id, data)
                                    .then((res) => {
                                        if (res.ok) {
                                            console.log('res: ', res);
                                            return res.json()
                                            // if (isNew) location.assign(`/stock/${res.id}`)
                                        } else { throw (res.error)}
                                    })
                                    .then((data) => {
                                        if (isNew) {
                                            location.assign(`/orders/${data.retId.id}`)
                                        }
                                    })
                            }}
                            color="success"
                    >
                        Сохранить
                    </Button>
                </Stack>
                {/*<Divider component="div" textAlign="left"/>*/}
                <Box sx={{margin: '1ch'}}>
                    <TextField
                        id="id"
                        label="ID"
                        defaultValue={data.id}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="standard"
                        onChange={handlerDescriptionChange}
                    />
                    <TextField
                        id="name"
                        label="Заказчик"
                        defaultValue={data.name}
                        InputProps={{
                            readOnly: !edit && !isNew,
                        }}
                        variant="standard"
                        onChange={handlerDescriptionChange}
                    />
                </Box>
                <Box sx={{display: isNew ? 'none' : ''}}>
                    <Divider component="div" textAlign="left">Остаток</Divider>
                    <FullFeaturedCrudGrid orderId={id} rows={details} setRows={setDetails} stockArray={stock}/>
                </Box>
            </Stack>
        </div>
    );
}

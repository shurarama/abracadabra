'use client'
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import {Paper, Stack, styled} from "@mui/material";
import Button from "@mui/material/Button";


export default function ShowCutting(props)
{
    let i = 0;
    const {cuts} = props;
    console.log('cuts: ', cuts);

    const map = new Map(JSON.parse(cuts));
    console.log('map: ', map);

    return (
        <Stack spacing={2}>
            {Array.from(map, ([key, value]) => {
                return (
                    <Stack spacing={2} key={key}>
                        <Typography>{key}:</Typography>
                        {
                            Array.from(value, (cut) => {
                                return (
                                    <Stack justifyContent="flex-start" direction={'row'} spacing={2} key={cut.cuts}>
                                        <Typography>{cut.count}x</Typography>
                                        <Stack direction={'row'} spacing={0} alignItems="flex-start"
                                               sx={{backgroundColor: '#234b4a', width: '100%'}} >
                                            {
                                                cut.cuts.map((slice) => {
                                                    return (
                                                        <Box key={i++} sx={{width: slice/600, border: '1px solid', backgroundColor: '#4eccca', textAlign: 'center'}} >
                                                            {slice}
                                                        </Box>
                                                    )
                                                })
                                            }
                                        </Stack>
                                    </Stack>
                                );
                            })
                        }
                    </Stack>
                );
            })}
        </Stack>
    );
}

{/*// <Box>*/}
{/*//     <Button onClick={calc(stack)}>Test</Button>*/}
{/*//     <Stack spacing={2}>*/}
{/*//         {stack.map((row) => {*/}
{/*//             return (*/}
{/*//                 <Box key={row}>*/}
{/*//                     <Typography>{row.count}</Typography>*/}
{/*//                     <Stack direction={'row'} spacing={0} alignItems="flex-start" sx={{*/}
{/*//                         backgroundColor: '#4eccca',*/}
{/*//                     }}>*/}
{/*//                         {row.cuts.map((cut) => (<Box key={cut} sx={{*/}
{/*//                             width: cut/600,*/}
{/*//                             border: '1px solid'*/}
{/*//                         }}>{cut} </Box>))}*/}
{/*//                     </Stack>*/}
{/*//                 </Box>*/}
{/*//             )*/}
{/*//         })}*/}
{/*//     </Stack>*/}
{/*// </Box>*/}
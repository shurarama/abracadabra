'use client'
import * as React from 'react';
import Typography from '@mui/material/Typography';
// import {howToCutBoards1D} from "@/components/cutting-stock/1D";
import Box from "@mui/material/Box";
import {Paper, Stack, styled} from "@mui/material";
import Button from "@mui/material/Button";

const calc = (rows) => () => {
    const res = fetch(`http://localhost:3000/orders/calc/api`, {
        cache: "no-store",
        method: 'POST',
        body: JSON.stringify(rows),
        headers: {
            'content-type': 'application/json'
        }
    })
}
export default function HomePage() {
  // const input1 = [
  //   { size: 70, count: 21 },
  //   { size: 150, count: 17 },
  //   { size: 300, count: 7 },
  // ]
  //
  //   const input2 = [
  //       { size: 11, count: 28 },
  //       { size: 21, count: 14 },
  //       { size: 84, count: 8 },
  //       { size: 3.5, count: 42 },
  //       { size: 79.5, count: 4 },
  //   ]
  // const output1 = howToCutBoards1D({
  //   stockSizes: [{ size: 600, cost: 1 }],
  //   bladeSize: 0.125,
  //   requiredCuts: input1,
  // })
  //
  //
  // console.log(JSON.stringify(output1, null,2));
  const stack = [ { "count": 4, "cuts": [ 150, 150, 150, 70, 70 ] }, { "count": 1, "cuts": [ 300, 70, 70, 70, 70 ] }, { "count": 7, "cuts": [ 300, 150, 70, 70 ] } ];
  return (
      <Box>
          <Button onClick={calc(stack)}>Test</Button>
          <Stack spacing={2}>
              {stack.map((row) => {
                  return (
                      <Box key={row}>
                          <Typography>{row.count}</Typography>
                          <Stack direction={'row'} spacing={0} alignItems="flex-start" sx={{
                          backgroundColor: '#4eccca',
                          }}>
                              {row.cuts.map((cut) => (<Box key={cut} sx={{
                                  width: cut/600,
                                  border: '1px solid'
                              }}>{cut} </Box>))}
                          </Stack>
                      </Box>
                  )
              })}
          </Stack>
      </Box>
  );
}

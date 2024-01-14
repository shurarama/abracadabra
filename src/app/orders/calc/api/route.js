import clientPromise from "../../../../lib/mongodb";
import {NextResponse} from "next/server";
import {Long} from "mongodb";
import {howToCutBoards1D} from "@/components/cutting-stock/1D";

export async function POST(Request, { params }) {
    const data  = await Request.json();
    console.log('data: ', data);

    const inputs = new Map();
    console.log(inputs);
    data.map((input) => {
        if (inputs.has(input.name)) {
            inputs.set(input.name, [...inputs.get(input.name), {size: parseInt(input.size), count: parseInt(input.count)}])
        } else {
            inputs.set(input.name, [{size: parseInt(input.size), count: parseInt(input.count)}]);

        }
    });
    console.log('inputs: ', inputs);

    const outputs = new Map();

    for (const [key, value] of inputs)
    {
        const output = howToCutBoards1D({
            stockSizes: [{ size: 600, cost: 1 }],
            bladeSize: 0,
            requiredCuts: value,
        })
        outputs.set(key, output.map((cut) => ({count: cut.count, cuts: cut.cuts})));
    }

    // console.log('outputs: ', JSON.stringify(Object.fromEntries(outputs), null,2));
    return NextResponse.json(JSON.stringify(Array.from(outputs.entries())));


}
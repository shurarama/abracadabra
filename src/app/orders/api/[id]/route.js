import clientPromise from "../../../../lib/mongodb";
import {NextResponse} from "next/server";
import {Long} from "mongodb";

export async function GET(Request, { params }) {
    const { id } = params;

    try {
        const client = await clientPromise;
        const db = client.db("qwe");

        const order = await db
            .collection("orders")
            .findOne({id: Long(id)});
        console.log('order: ', order);


        return NextResponse.json(order);
    } catch (e) {
        return NextResponse("Something went wrong: " + e);
    }
}

export async function POST(req, { params }) {
    const { id } = params;
    console.log(id)
    const data  = await req.json()
    console.log(data)

    try {
        const client = await clientPromise;
        const db = client.db("qwe");

        if (id === 'new') {
            const stockById = await db
                .collection("orders")
                .insertOne(data);
            console.log('stockById: ', stockById);
            const retId = await db
                .collection("orders")
                .findOne({_id: stockById.insertedId});
            console.log('retId: ', retId);
            return NextResponse.json({ retId });
        } else {
            const stockById = await db
                .collection("orders")
                .updateOne(
                    {id: Long(id)},
                    { $set: { ...data } });
            return NextResponse.json({ stockById });
        }
    } catch (e) {
        return NextResponse("Something went wrong: " + e);
    }
}
import clientPromise from "../../../../lib/mongodb";
import {NextResponse} from "next/server";
import {Long} from "mongodb";

export async function GET(Request, { params }) {
    const { id } = params;

    try {
        const client = await clientPromise;
        const db = client.db("qwe");

        const stockById = await db
            .collection("stock")
            .findOne({id: Long(id)});

        return NextResponse.json({ stockById });
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
                .collection("stock")
                .insertOne(data);
            console.log('stockById: ', stockById);
            const retId = await db
                .collection("stock")
                .findOne({_id: stockById.insertedId});
            console.log('retId: ', retId);
            return NextResponse.json({ retId });
        } else {
            const stockById = await db
                .collection("stock")
                .updateOne(
                    {id: Long(id)},
                    { $set: { ...data } });
            return NextResponse.json({ stockById });
        }
    } catch (e) {
        return NextResponse("Something went wrong: " + e);
    }
}
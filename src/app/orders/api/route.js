import clientPromise from "../../../lib/mongodb";
import {NextResponse} from "next/server";
import {Long} from "mongodb";

export async function GET(Request) {
    try {
        const client = await clientPromise;
        const db = client.db("qwe");

        const stock = await db
            .collection("orders")
            .find({})
            .project({_id: 0, id: 1, name: 1 })
            .toArray();

        return NextResponse.json({ stock });
    } catch (e) {
        return NextResponse("Something went wrong: " + e);
    }
}

export async function DELETE(req) {
    const data  = await req.json();
    console.log('data: ', data);

    try {
        const client = await clientPromise;
        const db = client.db("qwe");

        const stockById = await db
            .collection("orders")
            .deleteMany({id: {$in: data }});
        return NextResponse.json({ stockById });
    } catch (e) {
        return NextResponse("Something went wrong: " + e);
    }
}
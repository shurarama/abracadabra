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
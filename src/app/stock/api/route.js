import clientPromise from "../../../lib/mongodb";
import {NextResponse} from "next/server";

export async function GET(Request) {
    try {
        const client = await clientPromise;
        const db = client.db("qwe");

        const stock = await db
            .collection("stock")
            .find({})
            .project({_id: 0, id: 1, name: 1 })
            .toArray();

        return NextResponse.json({ stock });
    } catch (e) {
        return NextResponse("Something went wrong: " + e);
    }
}
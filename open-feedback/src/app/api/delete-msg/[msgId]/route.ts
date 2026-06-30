import { getServerSession } from "next-auth";
import dbConnect from "@/src/lib/db";
import UserModel from "@/src/models/User";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "@/src/models/User";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ msgId: string }> }
) {
    const { msgId } = await params;
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
      	return Response.json({ success: false, message: "Not Authenticated" }, { status: 401 });
    }

	try {
		// $pull removes matching element from the messages array
		const result = await UserModel.updateOne(
			{ _id: user._id },
			{ $pull: { message: { _id: msgId } } }
		);

		if (result.modifiedCount === 0) {
			return Response.json({ success: false, message: "Message not found" }, { status: 404 });
		}

		return Response.json({ success: true, message: "Message deleted" }, { status: 200 });
	} catch (error) {
		return Response.json({ success: false, message: "Error deleting message" }, { status: 500 });
	}
}
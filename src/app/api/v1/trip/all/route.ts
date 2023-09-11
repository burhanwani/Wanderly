import { getServerSession } from "next-auth";
import { getTrips } from "../../../../../lib/backend/services/trips.backend.services";
import { nextAuthOptions } from "../../../../../lib/config/auth/next-auth.config";
import { RESPONSE_CONSTANTS } from "../../../../../lib/constants/response.constants";

export async function GET() {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return RESPONSE_CONSTANTS[401];
  }
  try {
    const trips = await getTrips(userId);
    return RESPONSE_CONSTANTS[200](trips);
  } catch (err) {
    return RESPONSE_CONSTANTS[500](
      "Something went wrong while fetching trips."
    );
  }
}

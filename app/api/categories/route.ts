import { NextResponse } from "next/server";
import axios from "axios";
// import process from "process";

export async function GET() {
//   const token = process.env.NEXT_PUBLIC_API_TOKEN;
  try {
    const response = await axios.get(
      "https://oman.ahmarket.com/rest/V1/categories/list?searchCriteria[filterGroups][0][filters][0][field]=parent_id&searchCriteria[filterGroups][0][filters][0][value]=2&searchCriteria[filterGroups][0][filters][0][conditionType]=eq&fields=items[id,name,is_active,custom_attributes]&searchCriteria[filterGroups][1][filters][0][field]=is_active&searchCriteria[filterGroups][1][filters][0][value]=1&searchCriteria[filterGroups][1][filters][0][conditionType]=eq",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 2dhdhimvhb2eg5pczxquwhmh1e1v9x70`,
        //   zoneNumber: "2",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

import { Page, Document, View, Text } from "@react-pdf/renderer";

// Renders the Draft Packing Note PDF document
export default function PrintPackingNote(props) {
  const style = {
    pageStyling: {
      padding: "5%",
      fontSize: "10px",
      fontFamily: "Helvetica",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    globalPadding: { padding: "0.6%" },
    fontBold: {
      fontSize: "10px",
      fontFamily: "Helvetica-Bold",
    },
  };

  // Calculate total quantity
  var totalQty = 0;
  for (let j = 0; j < props.invDetailsData.length; j++) {
    const element = props.invDetailsData[j];
    totalQty = parseInt(totalQty) + parseInt(element.Qty);
  }

  // Calculate total weight
  var totalWeight = 0;
  for (let j = 0; j < props.invDetailsData.length; j++) {
    const element = props.invDetailsData[j];
    totalWeight =
      totalWeight + parseFloat(element.Qty) * parseFloat(element.Unit_Wt);
  }

  return (
    <>
      <Document>
        <Page size={[300]} style={style.pageStyling}>
          <View>
            <View style={{ padding: "15%" }}></View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  ...style.fontBold,
                  ...style.globalPadding,
                  fontSize: "11px",
                }}
              >
                Draft Packing List
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  width: "24%",
                  ...style.fontBold,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Cust</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Schedule</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>ID</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Type</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Date</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Level</Text>
                </View>
              </View>
              <View
                style={{
                  width: "72%",
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invRegisterData?.Cust_Name}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invRegisterData?.OrderScheduleNo}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invRegisterData?.DC_Inv_No}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invRegisterData?.DC_InvType}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invRegisterData?.Printable_Dc_inv_Date}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invRegisterData?.PN_PkngLevel}</Text>
                </View>
              </View>
            </View>
            <View style={{ ...style.fontBold, padding: "3%" }}>
              <Text>Page : 1/1</Text>
            </View>
            <View style={{ borderTop: "1px", borderBottom: "1px" }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  ...style.fontBold,
                  borderBottom: "1px",
                }}
              >
                <View style={{ width: "15%" }}>
                  <Text>Srl</Text>
                </View>
                <View style={{ width: "40%" }}>
                  <Text>Part No / Name</Text>
                </View>
                <View style={{ width: "15%" }}>
                  <Text>Qty</Text>
                </View>
                <View style={{ width: "15%" }}>
                  <Text>Packed</Text>
                </View>
                <View style={{ width: "15%" }}>
                  <Text>Unit Wt</Text>
                </View>
              </View>
              {props?.invDetailsData?.map((val, key) => (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: "15%" }}>
                    <Text>{key + 1}</Text>
                  </View>
                  <View style={{ width: "40%" }}>
                    <Text>{val.Dwg_No}</Text>
                  </View>
                  <View style={{ width: "15%" }}>
                    <Text>{val.Qty}</Text>
                  </View>
                  <View style={{ width: "15%" }}>
                    <Text></Text>
                  </View>
                  <View style={{ width: "15%" }}>
                    <Text>{parseFloat(val.Unit_Wt).toFixed(3)}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ width: "48%", ...style.fontBold }}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>No of Parts</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Total Qty</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Approx Wt</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Inspected and Cleared By</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text>Packed By</Text>
                </View>
              </View>
              <View style={{ width: "48%" }}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invDetailsData?.length}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{totalQty}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{parseFloat(totalWeight).toFixed(3)}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invRegisterData?.InspBy}</Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                  }}
                >
                  <Text>{props.invRegisterData?.PackedBy}</Text>
                </View>
              </View>
            </View>
            <View style={{ padding: "15%" }}></View>
          </View>
        </Page>
      </Document>
    </>
  );
}

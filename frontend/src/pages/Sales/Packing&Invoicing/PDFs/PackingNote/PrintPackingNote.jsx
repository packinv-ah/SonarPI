import { Page, Document, View, Text, Image } from "@react-pdf/renderer";
import MLLogo from "../../../../../ML-LOGO.png";

// Renders the Packing Note PDF document
export default function PrintPackingNote(props) {
  let headerFontSize = "13px";
  let subheaderFontsize = "11px";
  let fontSize = "9px";

  const style = {
    pageStyling: {
      padding: "2%",
      fontSize: fontSize,
      fontFamily: "Helvetica",
    },
    globalPadding: { padding: "0.6%" },
    footerRowPadding: { padding: "3px" },
    rowPadding: { padding: "0.6%" },
    fontBold: {
      fontSize: fontSize,
      fontFamily: "Helvetica-Bold",
    },
  };

  const copiesNames = [
    { copyName: "Original for Buyer" },
    { copyName: "Office Copy" },
  ];

  let pageQuantity = [];
  props.invDetailsData?.map((v1, k1) => {
    pageQuantity[k1] = 0;
    {
      v1?.map((v2, k2) => {
        pageQuantity[k1] = parseFloat(pageQuantity[k1]) + parseFloat(v2.Qty);
      });
    }
  });

  // Calculates total item count
  var totalItems = 0;
  for (let i = 0; i < props.invDetailsData?.length; i++) {
    const element = props.invDetailsData[i];
    totalItems = totalItems + element.length;
  }

  // Calculates total quantity
  var totalQty = 0;
  for (let i = 0; i < props.invDetailsData?.length; i++) {
    const element0 = props.invDetailsData[i];
    for (let j = 0; j < element0.length; j++) {
      const element1 = element0[j];
      totalQty = parseInt(totalQty) + parseInt(element1.Qty);
    }
  }

  // Calculates total weight
  var totalWeight = 0;
  for (let i = 0; i < props.invDetailsData.length; i++) {
    const element0 = props.invDetailsData[i];
    for (let j = 0; j < element0.length; j++) {
      const element1 = element0[j];
      totalWeight =
        totalWeight + parseFloat(element1.Qty) * parseFloat(element1.Unit_Wt);
    }
  }

  // Calculates pay on before date for credit bills
  let payOnBefore = "";
  if (
    props.invRegisterData?.BillType === "Credit" &&
    props.invRegisterData.Inv_No?.length > 0 &&
    props.invRegisterData.PaymentTerms?.match(/\d+/g)
  ) {
    let newInvDate = new Date(
      props.invRegisterData.Inv_Date?.split("/")[1] +
        "/" +
        props.invRegisterData.Inv_Date?.split("/")[0] +
        "/" +
        props.invRegisterData.Inv_Date?.split("/")[2]
    );

    newInvDate.setDate(
      newInvDate.getDate() +
        parseInt(props.invRegisterData.PaymentTerms.split(" Days Credit")[0])
    );
    payOnBefore =
      (parseInt(newInvDate.getDate()) < 10
        ? "0" + newInvDate.getDate()
        : newInvDate.getDate()) +
      "/" +
      (parseInt(newInvDate.getMonth()) + 1 < 10
        ? "0" + (parseInt(newInvDate.getMonth()) + 1)
        : parseInt(newInvDate.getMonth()) + 1) +
      "/" +
      newInvDate.getFullYear();
  }

  // Calculates financial years for packing note and invoice
  let pnDate = new Date(
    `${props.invRegisterData.Printable_DC_Date?.split("/")[1]}-${
      props.invRegisterData.Printable_DC_Date?.split("/")[0]
    }-${props.invRegisterData.Printable_DC_Date?.split("/")[2]}`
  );
  let InvDate = new Date(
    `${props.invRegisterData.Printable_Inv_Date?.split("/")[1]}-${
      props.invRegisterData.Printable_Inv_Date?.split("/")[0]
    }-${props.invRegisterData.Printable_Inv_Date?.split("/")[2]}`
  );

  let PNFinYear = "";
  let InvFinYear = "";

  if (pnDate.getMonth() + 1 <= 3) {
    PNFinYear = `${String(pnDate.getFullYear() - 1).substring(2)}/${String(
      pnDate.getFullYear()
    ).substring(2)}`;
  } else {
    PNFinYear = `${String(pnDate.getFullYear()).substring(2)}/${String(
      parseInt(pnDate.getFullYear()) + 1
    ).substring(2)}`;
  }

  if (InvDate.getMonth() + 1 <= 3) {
    InvFinYear = `${String(InvDate.getFullYear() - 1).substring(2)}/${String(
      InvDate.getFullYear()
    ).substring(2)}`;
  } else {
    InvFinYear = `${String(InvDate.getFullYear()).substring(2)}/${String(
      parseInt(InvDate.getFullYear()) + 1
    ).substring(2)}`;
  }

  return (
    <>
      <Document>
        {copiesNames?.map((copyVal, copyKey) => (
          <>
            {props?.invDetailsData?.map((outerVal, outerKey) => (
              <Page size="A4" style={{ ...style.pageStyling }}>
                <View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ width: "7%" }}>
                      <Image src={MLLogo} />
                    </View>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            borderBottom: "1px",
                            ...style.fontBold,
                            fontSize: headerFontSize,
                          }}
                        >
                          Packing Note and Delivery Challan
                        </Text>
                      </View>
                      <Text
                        style={{
                          ...style.fontBold,
                          fontSize: subheaderFontsize,
                        }}
                      >
                        {props.PDFData.RegisteredName}
                      </Text>
                      <Text style={{ ...style.fontBold }}>
                        GST: {props.PDFData.GST_No} CIN: {props.PDFData.CIN_No}
                      </Text>
                      <Text>{props.PDFData.RegistredOfficeAddress}</Text>
                      <Text>
                        {props.PDFData.PhonePrimary},{" "}
                        {props.PDFData.PhoneSecondary}, {props.PDFData.Email},{" "}
                        {props.PDFData.URL}
                      </Text>
                    </View>
                    {/* <View> */}
                    <Text style={{ width: "10%" }}>{copyVal.copyName}</Text>
                    {/* </View> */}
                  </View>
                  <View style={{ padding: "0.3%" }}></View>
                  <View style={{ border: "1px" }}>
                    <View
                      style={{
                        borderBottom: "1px",
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <View
                        style={{
                          width: "65%",
                          borderRight: "1px",
                          ...style.globalPadding,
                        }}
                      >
                        <Text style={{ ...style.fontBold }}>
                          Billing Address :
                        </Text>
                        <View style={{ ...style.globalPadding }}>
                          <Text style={{ ...style.fontBold }}>
                            {props.invRegisterData?.Cust_Name}
                          </Text>

                          <Text>
                            {props.invRegisterData?.Cust_Address.trim()},{"\n"}
                            {props.invRegisterData?.Cust_Place},{" "}
                            {props.invRegisterData?.Cust_State} -{" "}
                            {props.invRegisterData?.PIN_Code}
                          </Text>

                          <View
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <Text style={{ ...style.fontBold }}>GSTIN : </Text>
                            <Text>
                              {props.invRegisterData?.GSTNo === null ||
                              props.invRegisterData?.GSTNo === "null" ||
                              props.invRegisterData?.GSTNo === undefined ||
                              props.invRegisterData?.GSTNo === ""
                                ? ""
                                : props.invRegisterData?.GSTNo}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ width: "35%", ...style.globalPadding }}>
                        <Text style={{ ...style.fontBold }}>
                          Shipping Address :
                        </Text>
                        <View style={{ ...style.globalPadding }}>
                          <Text>
                            {props.invRegisterData?.Del_Address === null ||
                            props.invRegisterData?.Del_Address === "null" ||
                            props.invRegisterData?.Del_Address === undefined ||
                            props.invRegisterData?.Del_Address === ""
                              ? ""
                              : props.invRegisterData?.Del_Address}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View>
                      <View
                        style={{
                          borderBottom: "1px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>Customer PO</Text>
                        </View>
                        <View
                          style={{
                            width: "30%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text>{props.invRegisterData?.PO_No}</Text>
                        </View>
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>Page</Text>
                        </View>
                        <View style={{ width: "30%", ...style.globalPadding }}>
                          <Text>
                            {outerKey + 1} of {props.invDetailsData.length}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          borderBottom: "1px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>
                            Packing Note No
                          </Text>
                        </View>
                        <View
                          style={{
                            width: "30%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text>
                            {props.invRegisterData?.DC_No
                              ? `${PNFinYear}/${props.invRegisterData?.DC_No}`
                              : props.invRegisterData?.DCStatus}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>
                            Packing Date
                          </Text>
                        </View>
                        <View style={{ width: "30%", ...style.globalPadding }}>
                          <Text>
                            {props.invRegisterData?.Printable_DC_Date}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          borderBottom: "1px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>
                            Invoice Type
                          </Text>
                        </View>
                        <View
                          style={{
                            width: "30%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text>{props.invRegisterData?.DC_InvType}</Text>
                        </View>
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}></Text>
                        </View>
                        <View style={{ width: "30%", ...style.globalPadding }}>
                          <Text></Text>
                        </View>
                      </View>

                      <View
                        style={{
                          borderBottom: "1px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>Invoice No</Text>
                        </View>
                        <View
                          style={{
                            width: "30%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text>
                            {props.invRegisterData?.Inv_No
                              ? `${props.invRegisterData?.Inv_No} - ${InvFinYear}`
                              : ""}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>
                            Invoice Date
                          </Text>
                        </View>
                        <View style={{ width: "30%", ...style.globalPadding }}>
                          <Text>
                            {props.invRegisterData?.Printable_Inv_Date}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          borderBottom: "1px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>
                            Eway Bill No
                          </Text>
                        </View>
                        <View
                          style={{
                            width: "80%",
                            ...style.globalPadding,
                          }}
                        >
                          <Text>{props.invRegisterData?.EWayBillRef}</Text>
                        </View>
                      </View>
                      <View
                        style={{
                          borderBottom: "1px",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <View
                          style={{
                            width: "20%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>PAN No</Text>
                        </View>
                        <View
                          style={{
                            width: "23%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text>{props.PDFData.PAN_No}</Text>
                        </View>
                        <View
                          style={{
                            width: "17%",
                            borderRight: "1px",
                            ...style.globalPadding,
                          }}
                        >
                          <Text style={{ ...style.fontBold }}>MSME No</Text>
                        </View>
                        <View style={{ width: "40%", ...style.globalPadding }}>
                          <Text>{props.PDFData.MSMENo}</Text>
                        </View>
                      </View>
                    </View>
                    <View>
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          borderBottom: "1px",
                          ...style.globalPadding,
                        }}
                      >
                        <Text style={{ ...style.fontBold }}>Item List</Text>
                      </View>
                      <View>
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-satrt",
                            borderBottom: "1px",
                          }}
                        >
                          <View
                            style={{
                              display: "flex",
                              borderRight: "1px",
                              width: "7%",
                              ...style.globalPadding,
                            }}
                          >
                            <Text style={{ ...style.fontBold }}>SL No</Text>
                          </View>
                          <View
                            style={{
                              display: "flex",
                              borderRight: "1px",
                              width: "46%",
                              ...style.globalPadding,
                            }}
                          >
                            <Text style={{ ...style.fontBold }}>
                              Description of goods / Drawing No
                            </Text>
                          </View>
                          <View
                            style={{
                              display: "flex",
                              borderRight: "1px",
                              width: "21%",
                              ...style.globalPadding,
                            }}
                          >
                            <Text style={{ ...style.fontBold }}>Material</Text>
                          </View>
                          <View
                            style={{
                              display: "flex",
                              borderRight: "1px",
                              width: "9%",
                              ...style.globalPadding,
                            }}
                          >
                            <Text style={{ ...style.fontBold }}>Pnkg Lvl</Text>
                          </View>
                          <View
                            style={{
                              display: "flex",
                              borderRight: "1px",
                              width: "9%",
                              ...style.globalPadding,
                            }}
                          >
                            <Text style={{ ...style.fontBold }}>Insp Lvl</Text>
                          </View>
                          <View
                            style={{
                              display: "flex",
                              width: "8%",
                              ...style.globalPadding,
                            }}
                          >
                            <Text style={{ ...style.fontBold }}>Qty</Text>
                          </View>
                        </View>
                        <View style={{ height: "320px", borderBottom: "1px" }}>
                          {outerVal?.map((innerVal, innerKey) => (
                            <View
                              style={
                                innerKey + 1 === props.rowLimit
                                  ? {
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "flex-satrt",
                                    }
                                  : {
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "flex-satrt",
                                      borderBottom: "1px",
                                    }
                              }
                            >
                              <View
                                style={{
                                  display: "flex",
                                  borderRight: "1px",
                                  width: "7%",
                                  ...style.globalPadding,
                                }}
                              >
                                <Text>
                                  {props.rowLimit * outerKey + innerKey + 1}
                                </Text>
                              </View>
                              <View
                                style={{
                                  display: "flex",
                                  borderRight: "1px",
                                  width: "46%",
                                  ...style.globalPadding,
                                }}
                              >
                                <Text>{innerVal.Dwg_No}</Text>
                              </View>
                              <View
                                style={{
                                  display: "flex",
                                  borderRight: "1px",
                                  width: "21%",
                                  ...style.globalPadding,
                                }}
                              >
                                <Text>{innerVal.Mtrl}</Text>
                              </View>
                              <View
                                style={{
                                  display: "flex",
                                  borderRight: "1px",
                                  width: "9%",
                                  ...style.globalPadding,
                                }}
                              >
                                <Text>{innerVal.PkngLevel}</Text>
                              </View>
                              <View
                                style={{
                                  display: "flex",
                                  borderRight: "1px",
                                  width: "9%",
                                  ...style.globalPadding,
                                }}
                              >
                                <Text>{innerVal.InspLevel}</Text>
                              </View>
                              <View
                                style={{
                                  display: "flex",
                                  width: "8%",
                                  ...style.globalPadding,
                                }}
                              >
                                <Text>{innerVal.Qty}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>

                    <View style={{ marginTop: "0%", borderTopWidth: "1px" }}>
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          borderBottom: "1px",
                          ...style.fontBold,
                        }}
                      >
                        <View
                          style={{
                            ...style.globalPadding,
                            width: "25%",
                            borderRight: "1px",
                          }}
                        >
                          <Text>Page Items Count = {outerVal.length}</Text>
                        </View>

                        <View
                          style={{
                            ...style.globalPadding,
                            width: "25%",
                            borderRight: "1px",
                          }}
                        >
                          <Text>
                            Page Items Quantity = {pageQuantity[outerKey]}
                          </Text>
                        </View>
                        <View
                          style={{
                            ...style.globalPadding,
                            width: "25%",
                            borderRight: "1px",
                          }}
                        >
                          <Text>Total Item Count = {totalItems}</Text>
                        </View>
                        <View
                          style={{
                            ...style.globalPadding,
                            width: "25%",
                          }}
                        >
                          <Text>Total Items Quantity = {totalQty}</Text>
                        </View>
                      </View>

                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          borderBottom: "1px",
                          minHeight: "51px",
                        }}
                      >
                        <View
                          style={{
                            width: "66%",
                            borderRight: "1px",
                            ...style.globalPadding,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Text>{props.PDFData.DCterms}</Text>
                        </View>
                        <View style={{ width: "34%", ...style.globalPadding }}>
                          <Text>
                            Total Weight in KGs ={" "}
                            {parseFloat(totalWeight).toFixed(3)}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          ...style.fontBold,
                          minHeight: "51px",
                        }}
                      >
                        <View
                          style={{
                            width: "66%",
                            borderRight: "1px",
                            ...style.globalPadding,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <Text>Customer Signature with Seal</Text>
                        </View>
                        <View
                          style={{
                            width: "34%",
                            ...style.globalPadding,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                          }}
                        >
                          <Text>For, {props.PDFData.RegisteredName}</Text>
                          <Text>Authorised Signatory</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ ...style.fontBold }}>
                      Registered office :
                    </Text>
                    <Text>{props.PDFData.RegistredOfficeAddress}</Text>
                  </View>
                </View>
              </Page>
            ))}
          </>
        ))}
      </Document>
    </>
  );
}

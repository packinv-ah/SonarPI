import {
  Page,
  Document,
  StyleSheet,
  View,
  Text,
  Image,
} from "@react-pdf/renderer";

import MLLogo from "../../../../../../ML-LOGO.png";

const styles = StyleSheet.create({
  page: {
    fontSize: "9px",
    flexDirection: "column",
    padding: "10px",
    fontFamily: "Helvetica",
  },
  tableContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
    marginTop: "12px",
    height: "80px",
    width: "100%",
  },
  description: {
    width: "60%",
  },
  HeadingText: {
    textAlign: "center",
    marginLeft: "160px",
    flexDirection: "row",
    justifyContent: "center",
  },
  Heading: {
    textAlign: "center",
    flexDirection: "row",
    width: "500px",
    padding: "1px",
  },
  tableTitle: {
    marginTop: "10px",
    fontSize: "9px",
    fontFamily: "Helvetica-Bold",
    marginBottom: "10px",
  },
  underline: {
    textDecoration: "underline",
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flexDirection: "column",
  },
  globalfontwithbold: {
    fontSize: "9px",
    fontFamily: "Helvetica-Bold",
  },
  globalfontwithoutbold: {
    fontSize: "9px",
  },
  logo: {
    width: "60px",
    height: "80px",
  },
  pdfName: {
    width: "180px",
    marginLeft: "20px",
    marginTop: "10px",
  },
  upperleftLabels: {
    width: "60px",
    textAlign: "left",
    paddingBottom: "8px",
  },
  upperleftLabelsValues: {
    width: "120px",
    paddingBottom: "8px",
  },
  consigneeBlock: {
    width: "340px",
    border: 1,
    marginLeft: "10px",
    height: "160px",
  },
  subsectiondata: {
    marginLeft: "6px",
    width: "100%",
    textAlign: "left",
    flexDirection: "row",
    marginTop: "3px",
  },
  gstBlock: {
    width: "220px",
    borderRight: 1,
    borderTop: 1,
    borderBottom: 1,
    height: "160px",
  },
  gstBlockRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "5px",
    marginLeft: "10px",
  },
  heading: {},
  values: {
    width: "100px",
    marginTop: "5px",
  },
  table: {
    display: "table",
    width: "97.25%",
    marginLeft: "10px",
    marginRight: "auto",
    borderStyle: "solid",
    alignSelf: "center",
    borderWidth: 1,
    borderBottomWidth: 1,
    height: "220px",
  },
  tableTax: {
    display: "table",
    width: "96%",
    marginLeft: "15px",
    borderStyle: "solid",
    borderWidth: 1,
    borderBottomWidth: 1,
    height: "127px",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColSrl: {
    width: "8%",
    padding: 3,
  },
  tableCol: {
    width: "12.5%",
    padding: 4,
  },
  tableColTax: {
    width: "30%",
    padding: 4,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  text: {
    fontSize: "9px",
  },
  container: {
    flexDirection: "row",
    width: "100%",
  },
  remarksText: {
    marginLeft: "20px",
    marginTop: "20px",
  },
  globalPadding: { padding: "0.6%" },
  fontBold: {
    fontSize: "9px",
    fontFamily: "Helvetica-Bold",
  },
  sealSection: {
    marginLeft: "2px",
    marginTop: "36px",
    alignSelf: "center",
    width: "97%",
  },
});

// Renders the Delivery Challan PDF document
const DeliveryChallan = ({ formData, PDFData }) => {
  const dateParts = formData.dcDate.split("/");
  const formattedDate = new Date(
    `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <View style={styles.row}>
            <View style={styles.tableContainer}>
              <View style={{ width: "7%", marginLeft: "15px" }}>
                <Image src={MLLogo} />
              </View>
              <View style={[styles.column, { alignItems: "center" }]}>
                <View style={[styles.Heading, { justifyContent: "center" }]}>
                  <Text
                    style={[
                      styles.globalfontwithbold,
                      { textDecoration: "underline", fontSize: "13px" },
                    ]}
                  >
                    Returnable Delivery Challan
                  </Text>
                </View>
                <View style={[styles.Heading, { justifyContent: "center" }]}>
                  <Text
                    style={[styles.globalfontwithbold, { fontSize: "11px" }]}
                  >
                    {PDFData.RegisteredName}
                  </Text>
                </View>

                <View style={[styles.Heading, { justifyContent: "center" }]}>
                  <Text style={styles.globalfontwithbold}>
                    GSTIN: {PDFData.GST_No}, CIN: {PDFData.CIN_No}
                  </Text>
                </View>

                <View style={[styles.Heading, { justifyContent: "center" }]}>
                  <Text style={styles.globalfontwithoutbold}>
                    {PDFData.RegistredOfficeAddress}
                  </Text>
                </View>

                <View style={[styles.Heading, { justifyContent: "center" }]}>
                  <Text style={styles.globalfontwithoutbold}>
                    {PDFData.PhonePrimary} {PDFData.PhoneSecondary}
                    {PDFData.Email}
                    {PDFData.URL}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.consigneeBlock}>
                <View style={styles.column}>
                  <Text
                    style={{
                      ...styles.globalfontwithbold,
                      padding: 2,
                      marginLeft: "5px",
                      textDecoration: "underline",
                    }}
                  >
                    Consignee
                  </Text>

                  <View style={styles.subsectiondata}>
                    <Text style={styles.globalfontwithbold}>
                      {formData.custName}
                    </Text>
                  </View>
                  <View style={styles.subsectiondata}>
                    <Text style={styles.globalfontwithoutbold}>
                      {formData.custAddress}
                    </Text>
                  </View>

                  <Text
                    style={{
                      ...styles.globalfontwithbold,
                      marginLeft: "4px",
                      padding: 2,
                    }}
                  >
                    {formData.custCity} PIN - {formData.custPin}
                  </Text>

                  <Text
                    style={{
                      ...styles.globalfontwithbold,
                      marginLeft: "4px",
                      padding: 2,
                    }}
                  >
                    {formData.custState}
                  </Text>

                  <Text
                    style={{
                      ...styles.globalfontwithbold,
                      marginLeft: "4px",
                      padding: 2,
                      textDecoration: "underline",
                    }}
                  >
                    Delivery Address
                  </Text>

                  <View style={styles.subsectiondata}>
                    <Text style={styles.globalfontwithoutbold}>
                      {formData.deliveryAddress}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.column}>
              <View style={styles.gstBlock}>
                <View style={styles.gstBlockRow}>
                  <View style={{ width: "50%" }}>
                    <Text style={styles.globalfontwithoutbold}>GST No: </Text>
                  </View>
                  <View style={{ width: "100%" }}>
                    <Text style={styles.globalfontwithbold}>
                      {formData.gstNo}
                    </Text>
                  </View>
                </View>

                <View style={styles.gstBlockRow}>
                  <View style={{ width: "50%" }}>
                    <Text style={styles.globalfontwithoutbold}>DC No: </Text>
                  </View>
                  <View style={{ width: "100%" }}>
                    <Text style={styles.globalfontwithbold}>
                      {formData.dcNo}
                    </Text>
                  </View>
                </View>

                <View style={styles.gstBlockRow}>
                  <View style={{ width: "50%" }}>
                    <Text style={styles.globalfontwithoutbold}>Date: </Text>
                  </View>
                  <View style={{ width: "100%" }}>
                    <Text style={styles.globalfontwithbold}>
                      {formattedDate}
                    </Text>
                  </View>
                </View>

                <View style={styles.gstBlockRow}>
                  <View style={{ width: "50%" }}>
                    <Text style={styles.globalfontwithoutbold}>Value: </Text>
                  </View>
                  <View style={{ width: "100%" }}>
                    <Text style={styles.globalfontwithbold}>
                      {formData.taxableAmount}
                    </Text>
                  </View>
                </View>

                <View style={styles.gstBlockRow}>
                  <View style={{ width: "50%" }}>
                    <Text style={styles.globalfontwithoutbold}>Tax: </Text>
                  </View>
                  <View style={{ width: "100%" }}>
                    <Text style={styles.globalfontwithbold}>
                      {formData.taxAmt}
                    </Text>
                  </View>
                </View>

                <View style={styles.gstBlockRow}>
                  <View style={{ width: "50%" }}>
                    <Text style={styles.globalfontwithoutbold}>E Way No: </Text>
                  </View>
                  <View style={{ width: "100%" }}>
                    <Text style={styles.globalfontwithbold}>
                      {formData.ewayBillNo}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    ...styles.globalfontwithoutbold,
                    marginTop: "8px",
                    marginLeft: "10px",
                  }}
                >
                  Goods removed at : {formData.dcDate} {formData.selectedMode}
                </Text>

                <Text
                  style={{
                    ...styles.globalfontwithoutbold,
                    marginTop: "3px",
                    marginLeft: "10px",
                  }}
                >
                  {formData.vehicleDetails}
                </Text>

                <Text
                  style={{
                    ...styles.globalfontwithoutbold,
                    marginTop: "3px",
                    marginLeft: "10px",
                  }}
                >
                  Contact Name : {formData.deliveryContactName}
                </Text>

                <Text
                  style={{
                    ...styles.globalfontwithoutbold,
                    marginTop: "3px",
                    marginLeft: "10px",
                  }}
                >
                  Contact No :{formData.deliveryContactNo}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{ ...styles.row, marginTop: "10px", marginBottom: "10px" }}
          >
            <Text
              style={{
                ...styles.globalfontwithoutbold,
                marginLeft: "10px",
                padding: 3,
              }}
            >
              Reference :
            </Text>

            <Text
              style={{
                ...styles.globalfontwithbold,
                marginLeft: "5px",
                paddingTop: "3px",
              }}
            >
              {formData.reference}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.headerRow}>
              <View style={{ ...styles.tableColSrl, ...styles.headerCol }}>
                <Text style={styles.text}>Srl</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "40%" }}>
                <Text style={styles.text}>
                  Drawing Name / Description of Goods
                </Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>Material</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>HSN Code</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>Qty</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>UOM</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>Unit Price</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>Total</Text>
              </View>
            </View>

            {formData.tableData &&
              formData.tableData.map((data, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableColSrl}>
                    <Text style={styles.text}>{index + 1}</Text>
                  </View>
                  <View style={{ ...styles.tableCol, width: "40%" }}>
                    <Text style={styles.text}>
                      {data.Dwg_Code} / {data.Dwg_No}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Material}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Excise_CL_no}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Qty}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.UOM}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Unit_Rate}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Qty}</Text>
                  </View>
                </View>
              ))}
          </View>

          <View style={styles.container}>
            <View
              style={{ ...styles.tableTax, marginTop: "20px", width: "48%" }}
            >
              <View style={styles.headerRow}>
                <View style={{ ...styles.tableColTax, ...styles.headerCol }}>
                  <Text style={styles.text}>Tax Name</Text>
                </View>
                <View style={{ ...styles.tableCol, width: "30%" }}>
                  <Text style={styles.text}>Taxable Amount</Text>
                </View>
                <View
                  style={{
                    ...styles.tableCol,
                    ...styles.headerCol,
                    width: "30%",
                  }}
                >
                  <Text style={styles.text}>Tax Amount</Text>
                </View>
              </View>

              {formData.selectedTax &&
                formData.selectedTax.map((data, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={styles.tableColTax}>
                      <Text style={styles.text}>{data.Tax_Name}</Text>
                    </View>
                    <View style={{ ...styles.tableCol, width: "30%" }}>
                      <Text style={styles.text}>{data.TaxableAmount}</Text>
                    </View>
                    <View style={{ ...styles.tableCol, width: "30%" }}>
                      <Text style={styles.text}>{data.TaxAmt}</Text>
                    </View>
                  </View>
                ))}
            </View>

            <View style={{ ...styles.remarksText, width: "48%" }}>
              <Text>Remarks:</Text>
            </View>
          </View>
        </View>

        <View style={styles.sealSection}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              minHeight: "51px",
              border: 1,
            }}
          >
            <View
              style={{
                width: "66%",
                borderRight: "1px",
                ...styles.globalPadding,
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
                ...styles.globalPadding,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <Text>For : {PDFData.RegisteredName}</Text>
              <Text>Authorised Signatory</Text>
            </View>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={{ ...styles.fontBold }}>Registered office : </Text>
            <Text>{PDFData.RegistredOfficeAddress}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DeliveryChallan;

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
  cusdetailsection: {
    marginLeft: "8px",
    width: "340px",
    border: 1,
    padding: "1px",
    marginTop: "5px",
  },
  contactsection: {
    width: "220px",
    borderRight: 1,
    borderTop: 1,
    borderBottom: 1,
    padding: "1px",
    marginTop: "5px",
  },
  cusnameview: {
    width: "100px",
    paddingBottom: "3px",
    textAlign: "right",
  },
  custName: {
    width: "300px",
    paddingBottom: "3px",
    paddingHorizontal: "10px",
  },
  referenceLabel: {
    width: "100px",
    paddingBottom: "3px",
    textAlign: "right",
  },
  referenceValue: {
    width: "300px",
    paddingBottom: "3px",
    paddingHorizontal: "10px",
  },
  dcRefernce: {
    width: "100px",
    paddingBottom: "3px",
    textAlign: "right",
  },
  gstNoLabel: {
    width: "100px",
    textAlign: "right",
    paddingBottom: "3px",
  },
  dcReferncegstNoValue: {
    width: "300px",
    paddingBottom: "3px",
    paddingHorizontal: "10px",
  },
  voucherNoLabel: {
    width: "80px",
    paddingBottom: "3px",
    textAlign: "right",
    paddingRight: "5px",
  },
  voucherNoLabelValue: {
    width: "120px",
    paddingBottom: "3px",
    marginLeft: "5px",
  },
  dateEwayBillLabel: {
    width: "80px",
    paddingBottom: "3px",
    textAlign: "right",
    paddingRight: "5px",
  },
  dateEwayBillLabelValue: {
    width: "120px",
    paddingBottom: "3px",
    paddingLeft: "3px",
  },
  table: {
    display: "table",
    width: "96%",
    marginLeft: "auto",
    marginRight: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderBottomWidth: 1,
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
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  text: {
    fontSize: "9px",
  },
  quantityView: {
    width: "90%",
  },
  quantityViewtext: {
    marginLeft: "80%",
    marginTop: "10px",
  },
});

// Renders the Receipt Voucher PDF document
const ReceiptVoucher = ({ formData, PDFData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <View style={styles.row}>
            <View style={styles.tableContainer}>
              <View style={{ width: "7%", marginLeft: "15px" }}>
                <Image src={MLLogo} />
              </View>
              <View style={styles.column}>
                <View style={[styles.Heading, { justifyContent: "center" }]}>
                  <Text
                    style={[
                      styles.globalfontwithbold,
                      { textDecoration: "underline", fontSize: "13px" },
                    ]}
                  >
                    Returnable Material Receipt Voucher
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
            <View style={styles.cusdetailsection}>
              <View style={styles.row}>
                <View style={styles.cusnameview}>
                  <Text style={styles.globalfontwithoutbold}>
                    Received From
                  </Text>
                </View>
                <View style={styles.custName}>
                  <Text style={styles.globalfontwithbold}>
                    {formData.custName}({formData.custCode})
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.referenceLabel}>
                  <Text style={styles.globalfontwithoutbold}>Refrence</Text>
                </View>
                <View style={styles.referenceValue}>
                  <Text style={styles.globalfontwithbold}>
                    {formData.reference}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.dcRefernce}>
                  <Text style={styles.globalfontwithoutboldbold}>
                    DC Refrence
                  </Text>
                </View>
                <View style={styles.dcReferncegstNoValue}>
                  <Text style={styles.globalfontwithbold}>
                    {formData.Ref_VrNo}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.gstNoLabel}>
                  <Text style={styles.text}>GST NO</Text>
                </View>
                <View style={styles.dcReferncegstNoValue}>
                  <Text style={styles.globalfontwithbold}>
                    {formData.gstNo}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.contactsection}>
              <View style={styles.row}>
                <View style={styles.voucherNoLabel}>
                  <Text style={styles.globalfontwithoutbold}>Voucher No</Text>
                </View>

                <View style={styles.voucherNoLabelValue}>
                  <Text style={styles.globalfontwithbold}>
                    {formData.rvNo
                      ? formData.rvNo
                      : formData.selectedRowData?.RV_No || ""}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.dateEwayBillLabel}>
                  <Text style={styles.globalfontwithoutbold}>Date</Text>
                </View>

                <View style={styles.dateEwayBillLabelValue}>
                  <Text style={styles.globalfontwithbold}>
                    {formData.rvDate
                      ? formData.rvDate
                      : formData.selectedRowData?.RV_Date
                      ? new Date(
                          formData.selectedRowData.RV_Date
                        ).toLocaleDateString("en-GB")
                      : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.dateEwayBillLabel}>
                  <Text style={styles.globalfontwithoutbold}>
                    E Way Bill No
                  </Text>
                </View>

                <View style={styles.dateEwayBillLabelValue}>
                  <Text style={styles.globalfontwithbold}>
                    {formData.ewayBillNo
                      ? formData.ewayBillNo
                      : formData.selectedRowData?.EWayBillRef || ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.quantityView}>
            <Text style={styles.quantityViewtext}>Quantity</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.headerRow}>
              <View style={{ ...styles.tableColSrl, ...styles.headerCol }}>
                <Text style={styles.text}>Srl</Text>
              </View>
              <View style={{ ...styles.tableCol, width: "40%" }}>
                <Text style={styles.text}>Item Details</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>UOM</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>Received</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>Inspected</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>Accepted</Text>
              </View>
              <View style={{ ...styles.tableCol, ...styles.headerCol }}>
                <Text style={styles.text}>Rejected</Text>
              </View>
            </View>

            {formData.firstTable &&
              formData.firstTable.map((data, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableColSrl}>
                    <Text style={styles.text}>{index + 1}</Text>
                  </View>
                  <View style={{ ...styles.tableCol, width: "40%" }}>
                    <Text style={styles.text}>
                      {data.Part_Name} - {data.Part_Discription}
                    </Text>
                  </View>

                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.UOM}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Qty_Received}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Qty_Inspected}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Qty_Accepted}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.text}>{data.Qty_Rejected}</Text>
                  </View>
                </View>
              ))}
          </View>

          <View
            style={{
              marginLeft: "10px",
              textDecoration: "underline",
              marginTop: "20px",
            }}
          >
            <Text style={styles.globalfontwithbold}>Item Received by</Text>
          </View>

          <View
            style={{
              marginLeft: "10px",
              marginTop: "50px",
              textDecoration: "underline",
            }}
          >
            <Text style={styles.globalfontwithbold}>
              Inspected and Accepted
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReceiptVoucher;

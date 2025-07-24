Public Class Internal_RejectionForm
    Private rejReport As magod.PkngandInvoice.rejectionslistRow
    Public Sub New()

        ' This call is required by the Windows Form Designer.
        InitializeComponent()

        ' Add any initialization after the InitializeComponent() call.
        rejReport = PkngandInvoice1.rejectionslist.NewrejectionslistRow
        PkngandInvoice1.rejectionslist.AddrejectionslistRow(rejReport)
    End Sub
    Public Pro  perty CustCode() As String
        Get
            Return rejReport.Cust_Code
        End Get
        Set(ByVal value As String)
            rejReport.Cust_Code = value
        End Set
    End Property
    Public Property CustName() As String
        Get
            Return rejReport.Cust_Name
        End Get
        Set(ByVal value As String)
            rejReport.Cust_Name = value
        End Set
    End Property
    Public Property ScheduleNo() As String
        Get
            Return rejReport.OrderScheduleNo
        End Get
        Set(ByVal value As String)
            rejReport.OrderScheduleNo = value
        End Set
    End Property
    Public Property ScheduleId() As Int32
        Get
            Return rejReport.ScheduleId
        End Get
        Set(ByVal value As Int32)
            rejReport.ScheduleId = value
        End Set
    End Property
    Public Property RejReportNo() As String
        Get
            Return rejReport.Rej_ReportNo
        End Get
        Set(ByVal value As String)
            rejReport.Rej_ReportNo = value
        End Set
    End Property
    Public Property RejReportDate() As Date
        Get
            Return rejReport.Rej_ReportDate
        End Get
        Set(ByVal value As Date)
            rejReport.Rej_ReportDate = value
        End Set
    End Property
    Public Property RaisedBy() As String
        Get
            Return rejReport.RaisedBy
        End Get
        Set(ByVal value As String)
            rejReport.RaisedBy = value
        End Set
    End Property
    Public Property InternalReport() As Boolean
        Get
            Return rejReport.Internal
        End Get
        Set(ByVal value As Boolean)
            rejReport.Internal = value
        End Set
    End Property
    Public Property RejectionValue() As Decimal
        Get
            Return rejReport.RejctionValue
        End Get
        Set(ByVal value As Decimal)
            rejReport.RejctionValue = value
        End Set
    End Property
    Public Property AcceptedValue() As Decimal
        Get
            Return rejReport.AcceptedValue
        End Get
        Set(ByVal value As Decimal)
            rejReport.AcceptedValue = value
        End Set
    End Property
    Public Property RejectionStatus() As String
        Get
            Return rejReport.Rej_Status
        End Get
        Set(ByVal value As String)
            rejReport.Rej_Status = value
        End Set
    End Property
    Public Sub setLables()
        If rejReport.Internal Then

            Me.Label_RejType.Text = "Internal"
        Else

            Me.Label_RejType.Text = "Customer"
        End If
        Me.Label_RejReport.Text = rejReport.Rej_ReportNo
        Me.Label_Status.Text = rejReport.Rej_Status
        Me.Label_Cust.Text = String.Format("{0} ({1})", rejReport.Cust_Name, rejReport.Cust_Code)
        Me.Label_OrderRef.Text = rejReport.OrderScheduleNo
        Me.Label_RaisedBy.Text = rejReport.RaisedBy
    End Sub
    Public WriteOnly Property RejectedPartsList() As List(Of magod.Orders.orderscheduledetailsRow)

        Set(ByVal value As List(Of magod.Orders.orderscheduledetailsRow))
            For Each part In value
                If part.QtyProduced - part.QtyCleared - part.QtyRejected > 0 Then


                    Dim rejParts As magod.PkngandInvoice.internal_rejectionpartslistRow _
                    = PkngandInvoice1.internal_rejectionpartslist.Newinternal_rejectionpartslistRow
                    With rejParts
                        .Rej_Id = rejReport.Id
                        .Dwg_Name = part.DwgName
                        .Qty_Rejected = part.QtyProduced - part.QtyCleared - part.QtyRejected
                        .SchDetailsID = part.SchDetailsID
                        .Rejection_Reason = "Enter Reason For Rejecting Parts"
                    End With
                    PkngandInvoice1.internal_rejectionpartslist.Addinternal_rejectionpartslistRow(rejParts)
                End If

            Next
        End Set
    End Property

    Private Sub btn_RejReport_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_RejReport.Click
        Dim cmd As MySql.Data.MySqlClient.MySqlCommand = PkngInv.getDBLink.getCommand

        Dim srlNo As New magod.Voucher
        Dim curdate As Date = PkngInv.getCurDate
        Dim Fy As String = PkngInv.getFinYear(curdate)
        With srlNo

            .VoucherType = "Internal_Rejection"
            .PreFix = "IR / "
           
            .VoucherCreationRequsetDate = Today
            .ReviewPeriod = magod.ReviewPeriod.FinanceYear
            .ResetValue = 0
            .VoucherNoLength = 4
            .RunningNoTableName = "magod_runningno"
            .DataSchema = "magod_setup"
            .EffectiveFrom = Today
            .UnitName = PkngInv.UnitName
            .setCommand(cmd)
            .checkCreateRunningNo()
            .checkIfVoucherTypeExists()
        End With
        With cmd
            Try

                .Connection.Open()
                Dim RejReportNo As String = srlNo.getNextSrl
                .CommandText = "START TRANSACTION;"
                .ExecuteNonQuery()

                .CommandText = "INSERT INTO magodmis.rejectionslist(Rej_ReportNo, RaisedBy, Internal, " _
                & "Rej_ReportDate, RejctionValue, AcceptedValue,OrderScheduleNo, Cust_Code, Cust_Name, " _
                & " ScheduleId, Rej_Status) " _
                & "VALUES(@Rej_ReportNo, @RaisedBy, @Internal, @Rej_ReportDate, @RejctionValue, @AcceptedValue, " _
                & "@OrderScheduleNo, @Cust_Code, @Cust_Name,@ScheduleId, @Rej_Status); "
                rejReport.Rej_ReportDate = curdate
                rejReport.Rej_ReportNo = PkngInv.getFinYear(curdate) & " / " & RejReportNo
                With .Parameters
                    .AddWithValue("@Rej_ReportNo", rejReport.Rej_ReportNo)
                    .AddWithValue("@RaisedBy", rejReport.RaisedBy)
                    .AddWithValue("@Internal", rejReport.Internal)
                    .AddWithValue("@Rej_ReportDate", rejReport.Rej_ReportDate)
                    .AddWithValue("@RejctionValue", rejReport.RejctionValue)
                    .AddWithValue("@AcceptedValue", rejReport.AcceptedValue)
                    .AddWithValue("@OrderScheduleNo", rejReport.OrderScheduleNo)
                    .AddWithValue("@Cust_Code", rejReport.Cust_Code)
                    .AddWithValue("@Cust_Name", rejReport.Cust_Name)
                    '  .AddWithValue("@Cust_Reference", rejReport.Cust_Reference)
                    .AddWithValue("@ScheduleId", rejReport.ScheduleId)
                    .AddWithValue("@Rej_Status", rejReport.Rej_Status)

                End With
                .ExecuteNonQuery()
                .CommandText = "SELECT LAST_INSERT_ID();"
                rejReport.Id = .ExecuteScalar

                .CommandText = " INSERT INTO magodmis.internal_rejectionpartslist (Rej_Id, Dwg_Name, Qty_Rejected, Rejection_Reason, SchDetailsID) " _
                                & "VALUES(@Rej_Id, @Dwg_Name, @Qty_Rejected, @Rejection_Reason, @SchDetailsID);"

                With .Parameters
                    .AddWithValue("@Rej_Id", rejReport.Id)
                    .Add("@Dwg_Name", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                    .Add("@Qty_Rejected", MySql.Data.MySqlClient.MySqlDbType.Int24)
                    .Add("@Rejection_Reason", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                    .Add("@SchDetailsID", MySql.Data.MySqlClient.MySqlDbType.Int32)
                End With

                For Each part As magod.PkngandInvoice.internal_rejectionpartslistRow In PkngandInvoice1.internal_rejectionpartslist.Rows
                    .Parameters("@Dwg_Name").Value = part.Dwg_Name
                    .Parameters("@Qty_Rejected").Value = part.Qty_Rejected
                    .Parameters("@Rejection_Reason").Value = part.Rejection_Reason
                    .Parameters("@SchDetailsID").Value = part.SchDetailsID
                    .ExecuteNonQuery()
                Next

                .CommandText = " UPDATE magodmis.orderscheduledetails o SET o.`QtyRejected`=o.`QtyRejected`+@Qty_Rejected " _
                                & "WHERE o.`SchDetailsID`=@SchDetailsID;"
                For Each part As magod.PkngandInvoice.internal_rejectionpartslistRow In PkngandInvoice1.internal_rejectionpartslist.Rows
                    .Parameters("@Qty_Rejected").Value = part.Qty_Rejected
                    .Parameters("@SchDetailsID").Value = part.SchDetailsID
                    .ExecuteNonQuery()
                Next
                srlNo.setNext()
                .CommandText = "COMMIT"
                .ExecuteNonQuery()

                rejReport.AcceptChanges()
            Catch ex As Exception
                MsgBox(ex.Message)
                .CommandText = "RollBack"
                .ExecuteNonQuery()
            Finally
                .Connection.Close()
            End Try
            setLables()
        End With
    End Sub

    Private Sub Internal_RejectionForm_Load(sender As Object, e As EventArgs) Handles MyBase.Load

    End Sub
End Class
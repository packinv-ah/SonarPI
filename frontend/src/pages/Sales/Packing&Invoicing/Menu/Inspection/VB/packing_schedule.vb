Insp form :
-----------

Public Class InspForm

    Public Sub New(ByRef BS_PN As BindingSource)

        ' This call is required by the Windows Form Designer.
        InitializeComponent()

        ' Add any initialization after the InitializeComponent() call.
        Me.TextBox_InspBy.DataBindings.Add("Text", BS_PN, "InspBy")
        Me.TextBox_PackedBy.DataBindings.Add("Text", BS_PN, "PackedBy")
    End Sub
End Class

PN List :
---------
Public Class PackingNoteList
    Private strPNType As String
    Public Sub New(ByVal PNType As String, ByVal Status As String, Optional ByVal custCode As String = "")

        ' This call is required by the Windows Form Designer.
        InitializeComponent()
        ' Add any initialization after the InitializeComponent() call.
        Me.Label1.Text = String.Format("PN List : {0} Stauts {1}", PNType, Status)
        strPNType = PNType
        Dim SQL As String
        If custCode.Length = 0 Then
            SQL = String.Format("SELECT * FROM magodmis.draft_dc_inv_register d 
                    WHERE d.`InvoiceFor`='{0}' AND d.`DCStatus`='{1}';", PNType, Status)
        Else
            SQL = String.Format("SELECT * FROM magodmis.draft_dc_inv_register d 
                                WHERE d.`InvoiceFor`='{0}' AND d.`DCStatus`='{1}' 
                                AND d.`Cust_code`='{2}' ;", PNType, Status, custCode)
        End If
        With PkngInv.getCommand
            .CommandText = SQL
            .Connection.Open()
            PkngandInvoice1.draft_dc_inv_register.Load(.ExecuteReader)
            .Connection.Close()
        End With

        Select Case Status
            Case "Packed"
                DataGridView1.Columns("Inv_no").Visible = False
                DataGridView1.Columns("Inv_Date").Visible = False
                DataGridView1.Columns("DCno").Visible = True
                DataGridView1.Columns("DCDate").Visible = True
            Case "Despatched"
                DataGridView1.Columns("Inv_no").Visible = True
                DataGridView1.Columns("Inv_Date").Visible = True
                DataGridView1.Columns("DCno").Visible = False
                DataGridView1.Columns("DCDate").Visible = False
        End Select

    End Sub

    Public Sub New(ByVal DC As Boolean, ByVal PNType As String, ByVal Status As String, Optional ByVal custCode As String = "")
        ' This call is required by the Windows Form Designer.
        InitializeComponent()

        ' Add any initialization after the InitializeComponent() call.
        Me.Label1.Text = String.Format("PN List : {0} Stauts {1}", PNType, Status)

        strPNType = PNType
        Dim SQL As String
        If DC Then '**** Only DC No to be shown
            If custCode.Length = 0 Then
                SQL = String.Format("SELECT * FROM magodmis.draft_dc_inv_register d 
                    WHERE d.`DC_InvType`='{0}' AND d.`DCStatus`='{1}';", PNType, Status)
            Else
                SQL = String.Format("SELECT * FROM magodmis.draft_dc_inv_register d 
                                WHERE d.`DC_InvType`='{0}' AND d.`DCStatus`='{1}' 
                                AND d.`Cust_code`='{2}' ;", PNType, Status, custCode)
            End If
            'DCInvType
            DataGridView1.Columns("DCInvType").Visible = False
            DataGridView1.Columns("Inv_no").Visible = False
            DataGridView1.Columns("Inv_Date").Visible = False
            DataGridView1.Columns("DCno").Visible = True
            DataGridView1.Columns("DCDate").Visible = True

        Else '**** It is Invoice
            If custCode.Length = 0 Then
                SQL = String.Format("SELECT * FROM magodmis.draft_dc_inv_register d 
                    WHERE d.`InvoiceFor`='{0}' AND d.`DCStatus`='{1}';", PNType, Status)
            Else
                SQL = String.Format("SELECT * FROM magodmis.draft_dc_inv_register d 
                                WHERE d.`InvoiceFor`='{0}' AND d.`DCStatus`='{1}' 
                                AND d.`Cust_code`='{2}' ;", PNType, Status, custCode)
            End If
            Select Case Status
                Case "Packed"
                    DataGridView1.Columns("Inv_no").Visible = False
                    DataGridView1.Columns("Inv_no").Visible = False
                    DataGridView1.Columns("Inv_Date").Visible = False
                    DataGridView1.Columns("DCno").Visible = True
                    DataGridView1.Columns("DCDate").Visible = True
                Case "Despatched"
                    DataGridView1.Columns("Inv_no").Visible = True
                    DataGridView1.Columns("Inv_Date").Visible = True
                    DataGridView1.Columns("DCno").Visible = False
                    DataGridView1.Columns("DCDate").Visible = False
            End Select
        End If

        With PkngInv.getCommand
            .CommandText = SQL
            .Connection.Open()
            PkngandInvoice1.draft_dc_inv_register.Load(.ExecuteReader)
            .Connection.Close()
        End With
    End Sub


    Private Sub btn_Open_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_Open.Click
        Select Case strPNType
            Case "Misc"
                Using X As New Misc_Invoice(Me.DataGridView1.CurrentRow.Cells("DCInvNo").Value, "Misc")
                    X.WindowState = FormWindowState.Maximized
                    X.ShowDialog()
                End Using
            Case "Scrap"
                Using X As New Misc_Invoice(Me.DataGridView1.CurrentRow.Cells("DCInvNo").Value, "Scrap")
                    X.WindowState = FormWindowState.Maximized
                    X.ShowDialog()
                End Using
            Case "ReturnableDC"
                Using X As New ReturnableDC(Me.DataGridView1.CurrentRow.Cells("DCInvNo").Value)
                    AddHandler X.ReturnableDCUpdatedEvent, AddressOf updateDcInvStatus
                    X.WindowState = FormWindowState.Maximized
                    X.ShowDialog()
                    RemoveHandler X.ReturnableDCUpdatedEvent, AddressOf updateDcInvStatus
                End Using
            Case Else
                Using X As New magodInvoice(Me.DataGridView1.CurrentRow.Cells("DCInvNo").Value)
                    X.WindowState = FormWindowState.Maximized
                    X.ShowDialog()
                End Using
        End Select



    End Sub

    Private Sub updateDcInvStatus(ByVal sender As Object, ByVal e As magod.events.StatusUpdateEventArguments)
        Dim inv = PkngandInvoice1.draft_dc_inv_register.FindByDC_Inv_No(e.Voucher.DC_Inv_No)
        inv.DCStatus = e.Voucher.DCStatus
        inv.DC_No = e.Voucher.DC_No
        inv.DC_Date = e.Voucher.DC_Date

        inv.AcceptChanges()
    End Sub

    Private Sub DataGridView1_CellContentClick(sender As Object, e As DataGridViewCellEventArgs) Handles DataGridView1.CellContentClick

    End Sub
End Class

PackingInsp_Schedule :
----------------------

Public Class PkngInsp_Schedule
    Private schRow As magod.Orders.orderscheduleRow
    Private Da_PN, Da_PnDetails, DA_SchDetails As MySql.Data.MySqlClient.MySqlDataAdapter
    Private intSchId As Int32 = 41718
    Private strDcStatus As String
    Private DcInvNo As Integer

    Private Sub DGV_scheduledetails_MouseHover(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles DGV_scheduledetails.MouseHover
        ToolTip1.SetToolTip(sender, "Trial Message")
        ToolTip1.Show("This is Trial", sender, 2000)

    End Sub

#Region "SetUp"
    Public Sub New(ByVal ScheduleId As Int32)

        ' This call is required by the Windows Form Designer.
        InitializeComponent()

        ' Add any initialization after the InitializeComponent() call.
        PerpetuumSoft.Reporting.GlobalRenderingSettings.DisableFootersGenerateScriptCallBeforeDataBandRendering = True

        intSchId = 49985
        intSchId = ScheduleId
        Bs_exNot.DataSource = PkngInv.getExNotifications
        Bs_SalesPersons.DataSource = PkngInv.salesExecList

        LoadSchedule()
        setUpPnDA()
        resetInDraftParts()

    End Sub
    Private Sub setUpPnDA()
        DA_SchDetails = PkngInv.getDBLink.getMySqlDataAdopter
        With DA_SchDetails
            With .SelectCommand
                .CommandText = "SELECT o.*,if (a.InDraftPn is null,0,a.InDraftPn) as InDraftPn FROM magodmis.orderscheduledetails o LEFT JOIN " _
                       & "(SELECT  d.`ScheduleId`, sum(d1.`Qty`) as InDraftPN, d1.`OrderSchDetailsID`" _
                       & "FROM magodmis.draft_dc_inv_register d left join magodmis.draft_dc_inv_details d1 on  d1.`DC_Inv_No`=d.`DC_Inv_No`" _
                       & "WHERE d.`DCStatus`='Draft'  AND d.`ScheduleId`=@ScheduleId AND d1.`OrderSchDetailsID` is not null " _
                       & "GROUP BY d1.`OrderSchDetailsID`) as a on a.OrderSchDetailsID=o.SchDetailsID WHERE o.`ScheduleId`=@ScheduleId ;"
                .Parameters.AddWithValue("@ScheduleId", intSchId)

            End With
            DA_SchDetails.Fill(Orders1.orderscheduledetails)
            With .UpdateCommand
                .CommandText = "UPDATE magodmis.orderscheduledetails o SET o.QtyProduced=@QtyProduced, o.QtyCleared=@QtyCleared WHERE o.SchDetailsId=@SchDetailsId;"
                .Parameters.Add("@QtyCleared", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "QtyCleared")
                .Parameters.Add("@QtyProduced", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "QtyProduced")
                .Parameters.Add("@SchDetailsId", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "SchDetailsId")
            End With
        End With
        Da_PN = PkngInv.getDBLink.getMySqlDataAdopter
        With Da_PN
            With .SelectCommand

                .CommandText = "SELECT * FROM magodmis.draft_dc_inv_register d WHERE d.`ScheduleId` =@ScheduleId;"
                .Parameters.AddWithValue("@ScheduleId", intSchId)
                Da_PN.Fill(PkngandInvoice1.draft_dc_inv_register)
            End With
            With .UpdateCommand
                .CommandText = "UPDATE magodmis.draft_dc_inv_register " _
                & "SET InspBy=@InspBy,PackedBy=@PackedBy WHERE DC_Inv_No=@DC_Inv_No;"
                .Parameters.Add("@InspBy", MySql.Data.MySqlClient.MySqlDbType.VarChar, 40, "Inspby")
                .Parameters.Add("@PackedBy", MySql.Data.MySqlClient.MySqlDbType.VarChar, 40, "PackedBy")
                .Parameters.Add("@DC_Inv_No", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "Dc_inv_no")
            End With

        End With
        Da_PnDetails = PkngInv.getDBLink.getMySqlDataAdopter
        With Da_PnDetails
            With .SelectCommand
                .CommandText = "SELECT d1.* FROM magodmis.draft_dc_inv_register d, magodmis.draft_dc_inv_details d1 " _
            & " WHERE d.`ScheduleId` =@ScheduleId  AND d1.`DC_Inv_No`=d.`DC_Inv_No`;"
                .Parameters.AddWithValue("@ScheduleId", intSchId)
                Da_PnDetails.Fill(PkngandInvoice1.draft_dc_inv_details)

            End With
            With .UpdateCommand
                .CommandText = "UPDATE magodmis.draft_dc_inv_details d " _
        & "SET d.`Qty`=@Qty, d.`DC_Srl_Wt`=@DC_Srl_Wt, d.`Unit_Wt`=@Unit_Wt " _
        & "WHERE d.`Draft_dc_inv_DetailsID`=@Draft_dc_inv_DetailsID ;"
                With .Parameters
                    .Add("@Qty", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "Qty")
                    .Add("@DC_Srl_Wt", MySql.Data.MySqlClient.MySqlDbType.Double, 20, "DC_Srl_Wt")
                    .Add("@Unit_Wt", MySql.Data.MySqlClient.MySqlDbType.Double, 20, "Unit_Wt")
                    .Add("@Draft_dc_inv_DetailsID", MySql.Data.MySqlClient.MySqlDbType.Int32, 20, "Draft_dc_inv_DetailsID")

                End With
            End With
        End With
    End Sub
    Private Sub LoadSchedule()
        With PkngInv.getCommand
            .Connection.Open()
            .Parameters.Clear()
            .Parameters.AddWithValue("@ScheduleId", intSchId)

            .CommandText = "SELECT o.*,c.cust_name FROM magodmis.orderschedule o, magodmis.cust_data c " _
             & "WHERE o.`ScheduleId`=@ScheduleId AND c.Cust_code=o.Cust_Code;"
            Orders1.orderschedule.Load(.ExecuteReader)
            schRow = Orders1.orderschedule.FindByScheduleId(intSchId)

            '**** Set Produced Qty for Schedule
            .CommandText = "UPDATE magodmis.task_partslist t,magodmis.orderscheduledetails o SET o.`QtyProduced`=t.`QtyCleared` " _
                    & "WHERE o.`ScheduleId`=@ScheduleId AND o.`SchDetailsId`=t.`SchDetailsId`;"
            .ExecuteNonQuery()
            '**** Set Packed Qty for Schedule
            .CommandText = "UPDATE magodmis.orderscheduledetails o,(SELECT d1.`OrderSchDetailsID` , " _
            & "sum(d1.`Qty`) as qtyPacked FROM magodmis.draft_dc_inv_register d,magodmis.draft_dc_inv_details d1 " _
            & " WHERE d.`ScheduleId`=@ScheduleId AND d.`DC_Inv_No`=d1.`DC_Inv_No` " _
            & "AND d1.`DespStatus`<>'Draft' AND d1.`DespStatus`<>'Cancelled' " _
            & "GROUP BY d1.`Dwg_No`) as A SET o.qtyPacked=a.qtyPacked " _
            & " WHERE o.`ScheduleID`=@ScheduleId and a.OrderSchDetailsID=o.SchDetailsID; "
            .ExecuteNonQuery()
            '**** Set Despatched Qty for Schedule
            .CommandText = "UPDATE magodmis.orderscheduledetails o,(SELECT d1.`OrderSchDetailsID` , " _
            & "sum(d1.`Qty`) as qtyDispatched FROM magodmis.draft_dc_inv_register d,magodmis.draft_dc_inv_details d1 " _
            & "WHERE d.`ScheduleId`=@ScheduleId AND d.`DC_Inv_No`=d1.`DC_Inv_No` AND d1.`DespStatus`='Despatched' " _
            & "GROUP BY d1.`Dwg_No`) as A SET o.`QtyDelivered`=a.qtyDispatched " _
           & "  WHERE o.`ScheduleID`=@ScheduleId and a.OrderSchDetailsID=o.SchDetailsID;"
            .ExecuteNonQuery()
            '**** Set IN Draft PN Qty for Schedule
            .CommandText = "SELECT o.*,if (a.InDraftPn is null,0,a.InDraftPn) as InDraftPn FROM magodmis.orderscheduledetails o LEFT JOIN " _
            & "(SELECT  d.`ScheduleId`, sum(d1.`Qty`) as InDraftPN, d1.`OrderSchDetailsID`" _
            & "FROM magodmis.draft_dc_inv_register d left join magodmis.draft_dc_inv_details d1 on  d1.`DC_Inv_No`=d.`DC_Inv_No`" _
            & "WHERE d.`DCStatus`='Draft'  AND d.`ScheduleId`=@ScheduleId AND d1.`OrderSchDetailsID` is not null " _
            & "GROUP BY d1.`OrderSchDetailsID`) as a on a.ScheduleId=o.ScheduleId WHERE o.`ScheduleId`=@ScheduleId ;"

            ' Orders1.orderscheduledetails.Load(.ExecuteReader)

            PkngandInvoice1.internal_rejectionpartslist.Clear()
            PkngandInvoice1.rejectionslist.Clear()
            .CommandText = "SELECT * FROM magodmis.rejectionslist r WHERE r.`ScheduleId`=@ScheduleId;"

            PkngandInvoice1.rejectionslist.Load(.ExecuteReader)

            .CommandText = "SELECT i.* FROM magodmis.rejectionslist r,magodmis.internal_rejectionpartslist i WHERE r.`ScheduleId`=@ScheduleId AND i.`Rej_Id`=r.`Id`;"

            PkngandInvoice1.internal_rejectionpartslist.Load(.ExecuteReader)


            .Connection.Close()

            BS_ReadyForPacking.Filter = "QtyPacked < QtyScheduled OR QtyCleared > QtyPacked"


        End With
    End Sub
#End Region

#Region "Prepare Draft PN and Print"

    Private Sub btnClearAll_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnClearAll.Click
        BS_scheduleDetails.EndEdit()
        For Each part As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Rows
            If part.Selected Then
                '**** Check for inspection Level if > 1 then Prompt Insp Report
                '  If schRow.Type = "Profile" Then
                part.QtyCleared = part.QtyProduced - part.QtyRejected

                part.Selected = False
            End If
        Next
        DA_SchDetails.Update(Orders1.orderscheduledetails)
        resetInDraftParts()
        MsgBox("Part Data Updated")
    End Sub

    Private Sub btnSelectAll_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnSelectAll.Click
        If TabControl1.SelectedIndex = 0 Then
            For Each part As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Rows
                part.Selected = True
            Next
        ElseIf TabControl1.SelectedIndex = 1 Then
            For Each part As Object In BS_ReadyForPacking.List
                part.item("Selected") = True
            Next
            BS_ReadyForPacking.EndEdit()
        End If

    End Sub

    Private Sub btnRevers_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnRevers.Click
        If TabControl1.SelectedIndex = 0 Then
            For Each part As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Rows
                part.Selected = Not part.Selected
            Next
        ElseIf TabControl1.SelectedIndex = 1 Then
            For Each part As Object In BS_ReadyForPacking.List
                part.item("Selected") = Not part.item("Selected")
            Next
            BS_ReadyForPacking.EndEdit()
        End If

    End Sub

    Private Sub DGV_scheduledetails_CellValidating(ByVal sender As System.Object, ByVal e As System.Windows.Forms.DataGridViewCellValidatingEventArgs) Handles DGV_scheduledetails.CellValidating
        If Not e.ColumnIndex = -1 Then
            If Me.DGV_scheduledetails.Columns(e.ColumnIndex).Name _
                  = "Cleared" Then
                With Me.DGV_scheduledetails
                    If e.FormattedValue > .Rows(e.RowIndex).Cells("Produced").Value _
                    - .Rows(e.RowIndex).Cells("Rejected").Value Then

                        MsgBox("You cannot clear more quqntity than produced")
                        e.Cancel = True
                    ElseIf e.FormattedValue < .Rows(e.RowIndex).Cells("Packed").Value Then
                        MsgBox("Quantity Cleared has to be equal or more than Quantity Packed")
                        e.Cancel = True
                    End If
                End With
            End If
        End If

    End Sub

    Private Sub DGV_scheduledetails_CellValidated(ByVal sender As Object, ByVal e As System.Windows.Forms.DataGridViewCellEventArgs) Handles DGV_scheduledetails.CellValidated
        If Not e.ColumnIndex = -1 Then
            If Me.DGV_scheduledetails.Columns(e.ColumnIndex).Name _
                  = "Cleared" Then
                BS_scheduleDetails.EndEdit()
                DA_SchDetails.Update(Orders1.orderscheduledetails)
                resetInDraftParts()
            End If
        End If
    End Sub
    Private Sub btn_DeleteDraftPN_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_DeleteDraftPN.Click
        If Not DGV_PNList.CurrentRow Is Nothing Then
            If DGV_PNList.CurrentRow.Cells("DCStatus").Value = "Draft" Then
                With PkngInv.getCommand
                    .CommandText = " DELETE magodmis.d FROM magodmis.draft_dc_inv_register d " _
                                & "WHERE d.`DC_Inv_No`=@DC_Inv_No ;"
                    .Parameters.Clear()
                    .Parameters.AddWithValue("@DC_Inv_No", DGV_PNList.CurrentRow.Cells("DC_Inv_No").Value)

                    .Connection.Open()
                    .ExecuteNonQuery()
                    .Connection.Close()
                    For Each part As magod.PkngandInvoice.draft_dc_inv_detailsRow _
                        In PkngandInvoice1.draft_dc_inv_details.Select(String.Format("DC_Inv_No={0}", .Parameters("@DC_Inv_No").Value))
                        part.Delete()

                    Next
                    PkngandInvoice1.draft_dc_inv_details.AcceptChanges()
                    PkngandInvoice1.draft_dc_inv_register.FindByDC_Inv_No(.Parameters("@DC_Inv_No").Value).Delete()
                    PkngandInvoice1.draft_dc_inv_register.AcceptChanges()
                    resetInDraftParts()
                    .Parameters.Clear()

                End With
            End If
        End If


        '       
    End Sub
    Private Function resetInDraftParts() As Boolean
        Dim DraftQtyOK As Boolean = True
        Dim DraftParts = From detail In (From detail In PkngandInvoice1.draft_dc_inv_details, dc In PkngandInvoice1.draft_dc_inv_register _
                    Where dc.DCStatus = "Draft" And dc.DC_Inv_No = detail.DC_Inv_No _
                    Select detail.OrderSchDetailsID, detail.Qty) _
                    Group detail By detail.OrderSchDetailsID Into Group _
                    Select OrderSchDetailsID, TotalPartsInDraft = Group.Sum(Function(detail) detail.Qty)
        For Each schPart As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Rows
            schPart.InDraftPN = 0
        Next
        For Each part In DraftParts
            '  Console.WriteLine(part.OrderSchDetailsID & " -" & part.TotalPartsInDraft)
            Orders1.orderscheduledetails.FindBySchDetailsID(part.OrderSchDetailsID).InDraftPN = part.TotalPartsInDraft
        Next
        For Each schPart As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Rows
            schPart.PackNow = schPart.QtyCleared - schPart.QtyPacked - schPart.InDraftPN
            If schPart.PackNow < 0 Then
                DraftQtyOK = False
            End If
        Next
        Orders1.orderscheduledetails.AcceptChanges()
        For Each dr As DataGridViewRow In DGV_ReadyForPkng.Rows

            If Val(dr.Cells("PackNow1").Value) < 0 Then
                dr.DefaultCellStyle.BackColor = Color.Orange
                MsgBox(String.Format("{0} : Pack Quantity Greater Than Cleared Qty", dr.Cells("DwgNo1").Value))
            ElseIf Val(dr.Cells("PackNow1").Value) = 0 Then
                dr.DefaultCellStyle.BackColor = Color.LawnGreen
            Else
                dr.DefaultCellStyle.BackColor = Color.LightGreen
                '  MsgBox(String.Format("{0} : Pack Quantity Less Than Cleared Qty", dr.Cells("DwgNo1").Value))
            End If

        Next
        Return DraftQtyOK
    End Function

    Private Sub DGV_PNList_CellClick(ByVal sender As System.Object, ByVal e As System.Windows.Forms.DataGridViewCellEventArgs) Handles DGV_PNList.CellClick
        DcInvNo = DGV_PNList.Rows(e.RowIndex).Cells("DC_Inv_No").Value
        setDetailsButtonsStatus()
    End Sub

    Private Sub btn_createDraftPN_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_createDraftPN.Click
        If PkngInv.getCustData(schRow.Cust_Code).IsAddressNull Or
            PkngInv.getCustData(schRow.Cust_Code).Address.Length = 0 Then
            MsgBox("Customer Address Missing, Update Customer Address")
            Exit Sub
        End If
        If PkngInv.getCustData(schRow.Cust_Code).IsGSTNoNull Then
            MsgBox("Customer GST No Missing")
        End If
        CreateDraftPN()
    End Sub
    Private Sub CreateDraftPN()
        Dim SrlCounter As Int32 = Orders1.orderscheduledetails.Compute("Count([SchDetailsID])", "Selected")
        Dim Srl As Int16 = 21
        Dim DcInvNo As Int32
        Dim pkngLevel As String = "Pkng1"
        If SrlCounter > 0 Then
            '****** Check if Items with two types of packing have been selected
            Dim pkngCounter = From schSrl In Orders1.orderscheduledetails
                              Where schSrl.Selected And schSrl.PackNow > 0
                              Group schSrl By Key = schSrl.PackingLevel Into Group
                              Select PackingLevel = Key, partGroup = Group

            If pkngCounter.Count = 1 Then
                pkngLevel = pkngCounter(0).PackingLevel
            ElseIf pkngCounter.Count > 1 Then
                MsgBox("Select only items with same packing level")
                Exit Sub
            Else
                MsgBox("Select items TO PACK")
                Exit Sub
            End If

        End If
        If SrlCounter > 20 Then
            Dim result As MsgBoxResult = MsgBox(String.Format("The Packing Note has {0} serials, 
                                                Do you wish to create Single Invoice", SrlCounter), vbYesNoCancel, "Invoicing Option")
            If (result = MsgBoxResult.Yes) Then
                createSinglePN()

            ElseIf (result = MsgBoxResult.No) Then
                createMultiplePN()
            Else
                Exit Sub
            End If
        Else

            createSinglePN()
        End If



    End Sub
    Private Sub createSinglePN()
        Dim SrlCounter As Int32 = Orders1.orderscheduledetails.Compute("Count([SchDetailsID])", "Selected")
        Dim Srl As Int16 = 0
        Dim DcInvNo As Int32
        Dim pkngLevel As String = "Pkng1"
        Try
            '***** Create Draft Paking Note
            DcInvNo = addNewPN(PkngInv.getCommand, pkngLevel)
            If DcInvNo = -1 Then
                Exit Sub
            End If
            With PkngInv.getCommand
                .Connection.Open()
                Srl = 1
                'Excise_CL_no, DespStatus, PkngLevel, InspLevel
                .CommandText = "INSERT INTO magodmis.draft_dc_inv_details(DC_Inv_No, DC_Inv_Srl, ScheduleID, " _
                            & "OrderSchDetailsID, Cust_Code, Order_No, Order_Srl_No, OrderScheduleNo, " _
                            & "Dwg_Code, Dwg_No, Mtrl, Material, Qty, Unit_Wt, Excise_CL_no, DespStatus, PkngLevel, InspLevel) " _
                            & "VALUES (@DC_Inv_No, @DC_Inv_Srl, @ScheduleID, " _
                            & "@OrderSchDetailsID, @Cust_Code, @Order_No, @Order_Srl_No, @OrderScheduleNo, " _
                            & "@Dwg_Code, @Dwg_No, @Mtrl, @Material, @Qty, @Unit_Wt, @Excise_CL_no, @DespStatus, @PkngLevel, @InspLevel)"
                '.CommandText = "CALL magod_pkng_Inv.insertDraftInvoice_SchDetail(?,?,?,?,?,?);"
                .Parameters.Clear()
                .Parameters.Add("@DC_Inv_No", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Parameters.Add("@DC_Inv_Srl", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Parameters.Add("@ScheduleID", MySql.Data.MySqlClient.MySqlDbType.Int32).Value = intSchId
                .Parameters.Add("@OrderSchDetailsID", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Parameters.Add("@Cust_Code", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@Order_No", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@Order_Srl_No", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Parameters.Add("@OrderScheduleNo", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@Dwg_Code", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@Dwg_No", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@Mtrl", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@Material", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@Qty", MySql.Data.MySqlClient.MySqlDbType.Int32)

                .Parameters.Add("@Unit_Wt", MySql.Data.MySqlClient.MySqlDbType.Double)
                .Parameters.Add("@Excise_CL_no", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@DespStatus", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@PkngLevel", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                .Parameters.Add("@InspLevel", MySql.Data.MySqlClient.MySqlDbType.VarChar)

                For Each schSrl As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Select("Selected")
                    If schSrl.PackNow > 0 Then

                        If addNewPNSrl(PkngInv.getCommand, schSrl, Srl, DcInvNo) Then
                            Srl += 1
                        Else
                            MsgBox("Error Creating PN for " & schSrl.DwgName)
                            Exit Sub
                        End If
                    End If




                Next

            End With
        Catch ex As Exception
            MsgBox(ex.Message)
        Finally
            PkngInv.getCommand.Connection.Close()
        PkngInv.getCommand.Parameters.Clear()
        resetInDraftParts()
        End Try

    End Sub
    Private Sub createMultiplePN()
        Dim SrlCounter As Int32 = Orders1.orderscheduledetails.Compute("Count([SchDetailsID])", "Selected")
        Dim Srl As Int16 = 21
        Dim DcInvNo As Int32
        Dim pkngLevel As String = "Pkng1"
        Try

            With PkngInv.getCommand

                For Each schSrl As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Select("Selected")

                    If schSrl.PackNow > 0 Then

                        If Srl = 21 Then
                            '***** Create Draft Paking Note
                            DcInvNo = addNewPN(PkngInv.getCommand, pkngLevel)
                            If DcInvNo = -1 Then
                                Exit Sub
                            End If
                            Srl = 1
                            'Excise_CL_no, DespStatus, PkngLevel, InspLevel
                            .CommandText = "INSERT INTO magodmis.draft_dc_inv_details(DC_Inv_No, DC_Inv_Srl, ScheduleID, " _
                            & "OrderSchDetailsID, Cust_Code, Order_No, Order_Srl_No, OrderScheduleNo, " _
                            & "Dwg_Code, Dwg_No, Mtrl, Material, Qty, Unit_Wt, Excise_CL_no, DespStatus, PkngLevel, InspLevel) " _
                            & "VALUES (@DC_Inv_No, @DC_Inv_Srl, @ScheduleID, " _
                            & "@OrderSchDetailsID, @Cust_Code, @Order_No, @Order_Srl_No, @OrderScheduleNo, " _
                            & "@Dwg_Code, @Dwg_No, @Mtrl, @Material, @Qty, @Unit_Wt, @Excise_CL_no, @DespStatus, @PkngLevel, @InspLevel)"
                            '.CommandText = "CALL magod_pkng_Inv.insertDraftInvoice_SchDetail(?,?,?,?,?,?);"
                            .Parameters.Clear()
                            .Parameters.Add("@DC_Inv_No", MySql.Data.MySqlClient.MySqlDbType.Int32)
                            .Parameters.Add("@DC_Inv_Srl", MySql.Data.MySqlClient.MySqlDbType.Int32)
                            .Parameters.Add("@ScheduleID", MySql.Data.MySqlClient.MySqlDbType.Int32).Value = intSchId
                            .Parameters.Add("@OrderSchDetailsID", MySql.Data.MySqlClient.MySqlDbType.Int32)
                            .Parameters.Add("@Cust_Code", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@Order_No", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@Order_Srl_No", MySql.Data.MySqlClient.MySqlDbType.Int32)
                            .Parameters.Add("@OrderScheduleNo", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@Dwg_Code", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@Dwg_No", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@Mtrl", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@Material", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@Qty", MySql.Data.MySqlClient.MySqlDbType.Int32)

                            .Parameters.Add("@Unit_Wt", MySql.Data.MySqlClient.MySqlDbType.Double)
                            .Parameters.Add("@Excise_CL_no", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@DespStatus", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@PkngLevel", MySql.Data.MySqlClient.MySqlDbType.VarChar)
                            .Parameters.Add("@InspLevel", MySql.Data.MySqlClient.MySqlDbType.VarChar)

                        End If
                        '*****'Insert Max of 20 Srls
                        ' Console.WriteLine(Srl)
                        .Connection.Open()
                        If addNewPNSrl(PkngInv.getCommand, schSrl, Srl, DcInvNo) Then
                            Srl += 1
                        Else
                            MsgBox("Error Creating PN for " & schSrl.DwgName)
                            Exit Sub
                        End If
                        .Connection.Close()
                        ' Srl += 1
                    End If
                Next

            End With
        Catch ex As Exception
            MsgBox(ex.Message)
        Finally
            If Not PkngInv.getCommand.Connection.State = ConnectionState.Closed Then
                PkngInv.getCommand.Connection.Close()
            End If

            PkngInv.getCommand.Parameters.Clear()
            resetInDraftParts()
        End Try
    End Sub
    
    Dim newDc As magod.PkngandInvoice.draft_dc_inv_registerRow
    Private Function addNewPN(ByRef cmd As MySql.Data.MySqlClient.MySqlCommand, ByVal PkngLevel As String) As Integer

        Dim Dc_Inv_No As Int32 = -1
        newDc = PkngandInvoice1.draft_dc_inv_register.Newdraft_dc_inv_registerRow
        Try


            With newDc
                .ScheduleId = schRow.ScheduleId
                .Cust_Code = schRow.Cust_Code
                .DCStatus = "Draft"
                If .Cust_Code = "0000" Then
                    .DC_InvType = "Internal"
                ElseIf schRow.Internal Then
                    .DC_InvType = "Internal"
                Else

                    .DC_InvType = schRow.ScheduleType
                End If
                .DC_InvType = schRow.ScheduleType
                .PO_No = schRow.PO
                .OrderNo = schRow.Order_No
                .OrderScheduleNo = schRow.OrdSchNo
                .InspBy = schRow.SalesContact
                .PN_PkngLevel = PkngLevel


                .PaymentTerms = PkngInv.getBasicData.Order_List.FindByOrder_No(schRow.Order_No).Payment
                '******* If Payemnt is Credit Type Set Credit Inv
                If .PaymentTerms.Contains("Delivery") Then
                    .BillType = "Cash"
                Else
                    .BillType = "Credit"
                End If
                .OrderDate = schRow.schTgtDate
                Dim cust As magod.BasicDS.Cust_dataRow = PkngInv.getCustData(schRow.Cust_Code)
                .Cust_Name = cust.Cust_name

                '.Cust_Address = IIf(cust.IsBranchNull, "", "Branch - " & cust.Branch & vbCrLf)
                If Not cust.IsBranchNull Then
                    .Cust_Address = "Branch - " & cust.Branch & vbCrLf
                Else
                    .Cust_Address = ""
                End If


                If Not cust.IsAddressNull Then
                    .Cust_Address += cust.Address
                End If

                If Not cust.IsCityNull Then
                    .Cust_Place = cust.City
                End If
                If Not cust.IsStateNull Then
                    .Cust_State = cust.State
                End If
                If Not cust.IsStateIdNull Then
                    .Cust_StateId = cust.StateId
                End If
                If Not cust.IsPin_CodeNull Then
                    .PIN_Code = cust.Pin_Code
                End If
                .Del_responsibility = IIf(PkngInv.getBasicData.Order_List.FindByOrder_No(schRow.Order_No).Delivery, "Magod", "Customer")

                .Del_Address = PkngInv.getBasicData.Order_List.FindByOrder_No(schRow.Order_No).Del_Place

                If .Del_Address = "Same As Billing Address" Or .Del_Address = "EX Factory" Then
                    .Del_StateId = cust.StateId
                Else
                    '  .Del_StateId = PkngInv.getOrderData.Order_List.FindByOrder_No(schRow.Order_No).DelStateId

                End If

                If Not cust.IsGSTNoNull Then
                    .GSTNo = cust.GSTNo
                End If

                If Not schRow.IsTypeNull Then
                    .InvoiceFor = schRow.Type
                End If
            End With
            With cmd

                .CommandText = "INSERT INTO magodmis.draft_dc_inv_register(ScheduleId, Dc_inv_Date, DC_InvType, OrderNo," _
                    & "OrderScheduleNo, OrderDate, Cust_Code, Cust_Name, Cust_Address," _
                    & " Cust_Place, Cust_State,Cust_StateId, PIN_Code, Del_Address, Del_StateId,GSTNo, PO_No, " _
                    & "DCStatus,ExNotNo,InspBy, Del_responsibility, PaymentTerms, pkngLevel,BillType) " _
                    & "VALUES (@ScheduleId, Current_Timestamp(), @DC_InvType, @OrderNo," _
                    & "@OrderScheduleNo, @OrderDate, @Cust_Code, @Cust_Name, @Cust_Address," _
                    & "@Cust_Place, @Cust_State, @Cust_StateId @PIN_Code, @Del_Address,@Del_StateId, @GSTNo,@PO_No," _
                    & "@DCStatus,@ExNotNo,@InspBy, @Del_responsibility, @PaymentTerms, @pkngLevel);"
                .Parameters.Clear()
                .CommandText = "INSERT INTO magodmis.draft_dc_inv_register(`ScheduleId`,`Dc_inv_Date`,`DC_InvType`,
                                `PN_PkngLevel`,BillType,InvoiceFor) 
                                VALUES(@ScheduleId,Current_Timestamp(),@DC_InvType,'Pkng1' ,@BillType,@InvoiceFor);"
                With .Parameters
                    .Clear()
                    .AddWithValue("@ScheduleId", newDc.ScheduleId)
                    .AddWithValue("@DC_InvType", newDc.DC_InvType)
                    .AddWithValue("@BillType", newDc.BillType)
                    .AddWithValue("@InvoiceFor", newDc.InvoiceFor)
                End With
                .Connection.Open()
                .ExecuteNonQuery()
                .CommandText = "SELECT LAST_INSERT_ID();"
                newDc.DC_Inv_No = .ExecuteScalar
                .Parameters.AddWithValue("@DC_Inv_No", newDc.DC_Inv_No)
                .CommandText = "update magodmis.draft_dc_inv_register d, magodmis.orderschedule o,magodmis.order_list o1 " _
                            & "SET d.cust_code=o.cust_code, d.`PO_No`= o.`PO`, d.`OrderNo`= o.`Order_No`, " _
                            & "d.`OrderScheduleNo`=o.`OrdSchNo`,d.InspBy=o.salesContact,d.ExNotNo=o.ExNotNo," _
                            & "d.`Del_Address`=o1.Del_place,d.`Del_StateId`=o1.DelStateId,
                            d.`Del_responsibility` = if(o1.`delivery`=0,'Customer','Magod'), " _
                            & "d.`PaymentTerms`=o1.`Payment`,d.`OrderDate`=o.schTgtDate " _
                            & "WHERE d.`Dc_inv_no`=@Dc_inv_no AND o.`ScheduleID`=d.`ScheduleId` And o.`Order_no`=o1.`Order_no`;"

                .ExecuteNonQuery()

                .CommandText = "UPDATE  magodmis.draft_dc_inv_register d,magodmis.cust_data c " _
                    & "SET d.Cust_name=c.Cust_name,d.Cust_Address=concat(if (c.`Branch` is null,'',concat(c.`Branch`, '- Branch',char(13),Char(10))), " _
                    & "if( Right(c.`Address`,1) =char(10),Left(c.`Address`,length(c.`Address`)-2),c.`Address`) ), " _
                    & "d.Cust_place=c.City,d.Cust_state=c.state,d.Cust_stateId=c.stateId,d.PIN_code=c.pin_code,
                    d.`GstNo`=c.GSTNo, d.`Del_StateId`= CASE WHEN d.Del_Address = 'Same As Billing Address' THEN c.Stateid
                                WHEN d.Del_Address = 'EX Factory' THEN c.StateId END
                    WHERE d.`Dc_inv_no`=@Dc_inv_no AND c.`Cust_Code`=d.`Cust_Code`;"
                .ExecuteNonQuery()
                .Connection.Close()
                PkngandInvoice1.draft_dc_inv_register.Adddraft_dc_inv_registerRow(newDc)
                newDc.AcceptChanges()

                Return newDc.DC_Inv_No
            End With
        Catch ex As Exception
            MsgBox(ex.Message)
            Return -1
        End Try
    End Function
    Private Function addNewPNSrl(ByRef cmd As MySql.Data.MySqlClient.MySqlCommand, _
                    ByRef schSrl As magod.Orders.orderscheduledetailsRow, ByVal DcSrl As Int16, ByVal DCInvNo As Int32) As Boolean
        Try

            Dim newSrl As magod.PkngandInvoice.draft_dc_inv_detailsRow = PkngandInvoice1.draft_dc_inv_details.Newdraft_dc_inv_detailsRow
            Dim X As Random = New Random(DCInvNo)
            Dim Rdn, MarkFactor As Double
            Rdn = Math.Round(X.NextDouble, 2)
            Select Case schRow.ScheduleType
                Case "Job Work"
                    MarkFactor = 1 + 0.06 * Rdn
                Case "Sales"
                    MarkFactor = 1 + 0.02 * Rdn
                Case "Service"
                    MarkFactor = 1 + 0.06 * Rdn
                Case "InHouse"
                    MarkFactor = 1
                Case Else
                    MarkFactor = 1
            End Select


            With newSrl
                .Cust_Code = schSrl.Cust_Code
                .DC_Inv_No = DCInvNo
                .DC_Inv_Srl = DcSrl
                If Not schSrl.IsDwg_CodeNull Then
                    .Dwg_Code = schSrl.Dwg_Code
                Else
                    .Dwg_Code = Nothing
                End If
                .Dwg_No = schSrl.DwgName
                .Mtrl = schSrl.Mtrl_Code
                PkngInv.getMaterial.MtrlCode = schSrl.Mtrl_Code
                .Material = PkngInv.getMaterial.Material
                .Excise_CL_no = PkngInv.getMaterial.ExClNo
                .OrderSchDetailsID = schSrl.SchDetailsID
                .Qty = schSrl.PackNow
                .ScheduleID = schSrl.SchDetailsID
                .PackingLevel = schSrl.PackingLevel
                .InspLevel = schSrl.InspLevel
                If Not schSrl.IsOperationNull Then
                    .Operation = schSrl.Operation
                End If

                .Unit_Wt = Math.Round(MarkFactor * schSrl.UnitWt, 3)

            End With


            With cmd
                cmd.Parameters("@DC_Inv_No").Value = newSrl.DC_Inv_No
                cmd.Parameters("@DC_Inv_Srl").Value = newSrl.DC_Inv_Srl
                cmd.Parameters("@Qty").Value = newSrl.Qty
                cmd.Parameters("@DespStatus").Value = "Draft"

                cmd.Parameters("@Cust_Code").Value = newSrl.Cust_Code
                cmd.Parameters("@Order_No").Value = schRow.Order_No
                cmd.Parameters("@Order_Srl_No").Value = 0
                cmd.Parameters("@Dwg_No").Value = newSrl.Dwg_No
                cmd.Parameters("@Mtrl").Value = newSrl.Mtrl
                '  Material1.MtrlCode = BS_SchDetails.Current.item("Mtrl_Code")

                cmd.Parameters("@PkngLevel").Value = newSrl.PackingLevel
                cmd.Parameters("@Material").Value = newSrl.Material
                cmd.Parameters("@Excise_CL_no").Value = newSrl.Excise_CL_no
                cmd.Parameters("@InspLevel").Value = newSrl.InspLevel
                cmd.Parameters("@Unit_Wt").Value = newSrl.Unit_Wt
                cmd.Parameters("@OrderSchDetailsID").Value = newSrl.OrderSchDetailsID

                cmd.Parameters("@OrderScheduleNo").Value = schRow.OrdSchNo
                If Not newSrl.IsDwg_CodeNull Then
                    cmd.Parameters("@Dwg_Code").Value = newSrl.Dwg_Code
                Else
                    cmd.Parameters("@Dwg_Code").Value = Nothing
                End If

                cmd.ExecuteNonQuery()
                PkngandInvoice1.draft_dc_inv_details.Adddraft_dc_inv_detailsRow(newSrl)
                Dim sql As String = cmd.CommandText
                cmd.CommandText = "SELECT Last_Insert_Id();"
                newSrl.Draft_dc_inv_DetailsID = cmd.ExecuteScalar
                newSrl.AcceptChanges()
                cmd.CommandText = sql
                Return True
            End With
        Catch ex As Exception
            MsgBox(ex.Message)
            Return False
        End Try
    End Function
    Private Sub BS_PN_CurrentChanged(ByVal sender As Object, ByVal e As System.EventArgs) Handles BS_PN.CurrentChanged
        If Not BS_PN Is Nothing Then
            setDetailsButtonsStatus()
        End If
    End Sub

    Private Sub TabControl1_SelectedIndexChanged(ByVal sender As Object, ByVal e As System.EventArgs) Handles TabControl1.SelectedIndexChanged
        For Each part As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Rows
            part.Selected = False
        Next
        For Each dr As DataGridViewRow In DGV_ReadyForPkng.Rows

            If Val(dr.Cells("PackNow1").Value) < 0 Then
                dr.DefaultCellStyle.BackColor = Color.Orange
            ElseIf Val(dr.Cells("PackNow1").Value) = 0 Then
                dr.DefaultCellStyle.BackColor = Color.LawnGreen
            Else
                dr.DefaultCellStyle.BackColor = Color.LightGreen

            End If

        Next
    End Sub
    Private Sub setDetailsButtonsStatus()
        If Not (BS_PN Is Nothing OrElse BS_PN.Current Is Nothing) Then
            If BS_PN.Current.item("DCStatus") = "Draft" Then
                Me.btn_DeleteDraftPN.Enabled = True
                Me.Btn_saveDraft.Enabled = True
                Me.DGV_PnDetails.Enabled = True
                Me.btn_printDraft.Enabled = True
                Btn_PreParePN.Enabled = True
                Me.btn_OpenInv.Enabled = False

            Else
                Me.btn_DeleteDraftPN.Enabled = False
                Me.Btn_saveDraft.Enabled = False
                Me.DGV_PnDetails.Enabled = False
                Me.btn_printDraft.Enabled = False
                Btn_PreParePN.Enabled = False
                Me.btn_OpenInv.Enabled = True

            End If
            Select Case BS_PN.Current.item("DCStatus")
                Case "Draft"
                    Me.btn_DeleteDraftPN.Enabled = True
                    Me.Btn_saveDraft.Enabled = True
                    Me.DGV_PnDetails.Enabled = True
                    Me.DGV_PnDetails.Columns("UnitWt").ReadOnly = False
                    Me.DGV_PnDetails.Columns("Qty").ReadOnly = False
                    Me.btn_printDraft.Enabled = True
                    Btn_PreParePN.Enabled = True
                    Me.btn_OpenInv.Enabled = False
                    Me.btn_PrintPN.Enabled = False
                Case "Packed"
                    Me.btn_DeleteDraftPN.Enabled = False
                    Me.Btn_saveDraft.Enabled = False
                    Me.DGV_PnDetails.Enabled = False
                    Me.DGV_PnDetails.Columns("UnitWt").ReadOnly = True
                    Me.DGV_PnDetails.Columns("Qty").ReadOnly = True
                    Me.btn_printDraft.Enabled = False
                    Btn_PreParePN.Enabled = False
                    Me.btn_OpenInv.Enabled = True
                    Me.btn_PrintPN.Enabled = True

                Case "Despatched"
                    Me.btn_DeleteDraftPN.Enabled = False
                    Me.Btn_saveDraft.Enabled = False
                    Me.DGV_PnDetails.Enabled = True
                    Me.DGV_PnDetails.Columns("UnitWt").ReadOnly = True
                    Me.DGV_PnDetails.Columns("Qty").ReadOnly = True
                    Me.btn_printDraft.Enabled = False
                    Btn_PreParePN.Enabled = False
                    Me.btn_OpenInv.Enabled = True
                    Me.btn_PrintPN.Enabled = True
                Case "Delivered"
                    Me.btn_DeleteDraftPN.Enabled = False
                    Me.Btn_saveDraft.Enabled = False
                    Me.DGV_PnDetails.Enabled = True
                    Me.DGV_PnDetails.Columns("UnitWt").ReadOnly = True
                    Me.DGV_PnDetails.Columns("Qty").ReadOnly = True
                    Me.btn_printDraft.Enabled = False
                    Btn_PreParePN.Enabled = False
                    Me.btn_OpenInv.Enabled = True
                    Me.btn_PrintPN.Enabled = True
                Case Else
                    Me.btn_DeleteDraftPN.Enabled = False
                    Me.Btn_saveDraft.Enabled = False
                    Me.DGV_PnDetails.Enabled = False
                    Me.btn_printDraft.Enabled = False
                    Btn_PreParePN.Enabled = False
                    Me.btn_OpenInv.Enabled = False
                    Me.btn_PrintPN.Enabled = False
            End Select

        End If


    End Sub

    Private Sub Btn_saveDraft_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Btn_saveDraft.Click
        save()
    End Sub
    Private Sub save()
        BS_PNDetails.EndEdit()
        For Each item As magod.PkngandInvoice.draft_dc_inv_detailsRow In PkngandInvoice1.draft_dc_inv_details.Rows
            item.DC_Srl_Wt = item.Qty * item.Unit_Wt

        Next
        Da_PnDetails.Update(PkngandInvoice1.draft_dc_inv_details)
        MsgBox("Draft Details Saved")
    End Sub
    Private Sub DGV_PnDetails_CellValidated(ByVal sender As Object, ByVal e As System.Windows.Forms.DataGridViewCellEventArgs) Handles DGV_PnDetails.CellValidated
        If Not e.RowIndex = -1 Then
            If DGV_PnDetails.Columns(e.ColumnIndex).Name = "Qty" _
            Or DGV_PnDetails.Columns(e.ColumnIndex).Name = "UnitWt" Then
                DGV_PnDetails.Rows(e.RowIndex).Cells("DC_Srl_Wt").Value = Math.Round(DGV_PnDetails.Rows(e.RowIndex).Cells("Qty").Value _
                                                                                     * DGV_PnDetails.Rows(e.RowIndex).Cells("UnitWt").Value, 3)
            End If
            If DGV_PnDetails.Columns(e.ColumnIndex).Name = "Qty" Then
                resetInDraftParts()



            End If

        End If
    End Sub

    Private Sub DGV_PnDetails_CellValidating(ByVal sender As System.Object, ByVal e As System.Windows.Forms.DataGridViewCellValidatingEventArgs) Handles DGV_PnDetails.CellValidating
        If Not e.RowIndex = -1 Then
            If DGV_PnDetails.Columns(e.ColumnIndex).Name = "Qty" Then
                If Not IsNumeric(e.FormattedValue) Then
                    MsgBox("Enter as positive Number")
                    e.Cancel = True
                Else
                    If Val(e.FormattedValue) < 1 Then
                        MsgBox("Enter as positive Number")
                        e.Cancel = True
                    End If
                End If
            End If
            If DGV_PnDetails.Columns(e.ColumnIndex).Name = "UnitWt" Then

                If Not Val(e.FormattedValue) > 0 Then
                    MsgBox("Enter as positive Number")
                    e.Cancel = True
                End If
            End If
       
        End If
    End Sub
#End Region

#Region "Prepare PN and Print"


    Private Sub Btn_PreParePN_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Btn_PreParePN.Click
        save()
        If resetInDraftParts() Then


            For Each pnDetail As magod.PkngandInvoice.draft_dc_inv_detailsRow _
                In PkngandInvoice1.draft_dc_inv_details.Select("Dc_Inv_No =" & BS_PN.Current.item("Dc_Inv_No"))
                If pnDetail.Unit_Wt = 0 Then
                    MsgBox("Update Weight before Printing Packing Note")
                    Exit Sub
                End If
                If Not pnDetail.Qty > 0 Then
                    MsgBox("Update Quantity before Printing Packing Note")
                    Exit Sub
                End If

            Next
        End If
        Using X As New InspForm(BS_PN)
            X.ShowDialog()
            BS_PN.EndEdit()
            If BS_PN.Current.item("PackedBy").ToString.Length = 0 Then
                MsgBox("Enter Name of Packed By to continue")
                Exit Sub
            End If

            Da_PN.Update(PkngandInvoice1.draft_dc_inv_register)
        End Using
        If MsgBox("Do you wish to Prepare Final Packing Note Now?", MsgBoxStyle.YesNo, "Create Packing Note") = MsgBoxResult.Yes Then
            createPN()
            setDetailsButtonsStatus()
        End If
    End Sub
    Private Sub createPN()
        '**** Prepare and alot PN No
        Dim cmd As MySql.Data.MySqlClient.MySqlCommand = PkngInv.getDBLink.getCommand
        Dim sql, upDateSchQty As String
        Dim srlNo As New magod.Voucher
        Dim curdate As Date = PkngInv.getCurDate
        Dim Fy As String = PkngInv.getFinYear(curdate)
        Dim PkngNo As String
        With srlNo
            If BS_PN.Current.item("Dc_InvType") = "Internal" Or schRow.Cust_Code = "0000" Then
                .VoucherType = "InternalDC"
                .PreFix = "IDC-"
            Else
                .VoucherType = "PkngNoteNo"
            End If

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
        newDc = PkngandInvoice1.draft_dc_inv_register.FindByDC_Inv_No(BS_PN.Current("DC_Inv_No"))
        Try
            With cmd
                sql = "UPDATE magodmis.draft_dc_inv_register d SET d.`DC_No`=@DC_No, " _
                    & "d.`DC_Date`=CURDATE(), d.`DC_Fin_Year`=@DC_Fin_Year, d.`DCStatus`=@DCStatus " _
                    & "WHERE d.`DC_Inv_No`=@DC_Inv_No;"

                upDateSchQty = "UPDATE magodmis.draft_dc_inv_details d, magodmis.orderscheduledetails o " _
                & "SET d.`DespStatus`=@DespStatus,o.`QtyPacked`=o.`QtyPacked`+@QtyPacked " _
                & "WHERE d.`Draft_dc_inv_DetailsID` = @Draft_dc_inv_DetailsID AND o.`SchDetailsID`=d.`OrderSchDetailsID`;"

                .Connection.Open()

                PkngNo = srlNo.getNextSrl

                With .Parameters
                    .Clear()
                    .AddWithValue("@DC_No", PkngNo)
                    .AddWithValue("@DC_Date", curdate)
                    .AddWithValue("@DC_Fin_Year", Fy)
                    If BS_PN.Current.item("Dc_InvType") = "Internal" Or schRow.Cust_Code = "0000" Then
                        strDcStatus = "Delivered"
                        .AddWithValue("@DCStatus", "Delivered")
                    Else
                        strDcStatus = "Packed"
                        .AddWithValue("@DCStatus", "Packed")
                    End If

                    .AddWithValue("@DC_Inv_No", BS_PN.Current.item("DC_Inv_No"))
                End With
                cmd.CommandText = "START TRANSACTION"
                .ExecuteNonQuery()


                .CommandText = sql.ToString
                .ExecuteNonQuery()

                srlNo.setNext()
                .CommandText = upDateSchQty
                .Parameters.Add("@Draft_dc_inv_DetailsID", MySql.Data.MySqlClient.MySqlDbType.Int32)
                .Parameters.Add("@QtyPacked", MySql.Data.MySqlClient.MySqlDbType.Int32)
                If BS_PN.Current.item("Dc_InvType") = "Internal" Or schRow.Cust_Code = "0000" Then
                    .Parameters.AddWithValue("@DespStatus", "Delivered")
                Else
                    .Parameters.AddWithValue("@DespStatus", "Packed")
                End If

                '****** Upadte Qty Packed in Order schedule Details
                For Each pnSrl As Object In BS_PNDetails.List
                    .Parameters("@Draft_dc_inv_DetailsID").Value = pnSrl.Item("Draft_dc_inv_DetailsID")
                    .Parameters("@QtyPacked").Value = pnSrl.Item("Qty")
                    .ExecuteNonQuery()
                Next

                .CommandText = "COMMIT;"
                .ExecuteNonQuery()
                .Parameters.Clear()
                .Parameters.AddWithValue("@ScheduleId", schRow.ScheduleId)
                .CommandText = "SELECT o.*,if (a.InDraftPn is null,0,a.InDraftPn) as InDraftPn FROM magodmis.orderscheduledetails o LEFT JOIN " _
                    & "(SELECT  d.`ScheduleId`, sum(d1.`Qty`) as InDraftPN, d1.`OrderSchDetailsID`" _
                    & "FROM magodmis.draft_dc_inv_register d left join magodmis.draft_dc_inv_details d1 on  d1.`DC_Inv_No`=d.`DC_Inv_No`" _
                    & "WHERE d.`DCStatus`='Draft'  AND d.`ScheduleId`=@ScheduleId AND d1.`OrderSchDetailsID` is not null " _
                    & "GROUP BY d1.`OrderSchDetailsID`) as a on a.ScheduleId=o.ScheduleId WHERE o.`ScheduleId`=@ScheduleId ;"

                Orders1.orderscheduledetails.Clear()
                Orders1.orderscheduledetails.Load(.ExecuteReader)


                Me.BS_PN.Current("DC_No") = PkngNo
                Me.BS_PN.Current("DC_Date") = curdate
                Me.BS_PN.Current("DC_Fin_Year") = Fy
                Me.BS_PN.Current("DCStatus") = strDcStatus

                Me.BS_PN.EndEdit()
                PkngandInvoice1.draft_dc_inv_register.FindByDC_Inv_No(BS_PN.Current.item("DC_Inv_No")).AcceptChanges()
                resetInDraftParts()
                PrintPN()
            End With

        Catch ex As Exception
            cmd.CommandText = "ROLLBACK;"
            cmd.ExecuteNonQuery()
            MsgBox(ex.Message)

            Exit Sub
        Finally
            cmd.Connection.Close()
        End Try

    End Sub
    Private Sub PrintPN()
        Dim curdate As Date = PkngInv.getCurDate
        Dim Fy As String = PkngInv.getFinYear(curdate)
        Dim PkngNo As String = BS_PN.Current.Item("DC_No")
        With ReportManager1
            .DataSources.Clear()
            .DataSources.Add("PN", BS_PN)
        End With
        ' InlineReportSlot2.DesignTemplate()
        InlineReportSlot2.Prepare()


        Using X As New PerpetuumSoft.Reporting.View.PreviewForm(InlineReportSlot2)

            X.WindowState = FormWindowState.Maximized
            X.ShowDialog()

            '******* Create PDF of Packing Note

            Dim Fdir As IO.DirectoryInfo
            Dim file As IO.FileInfo

            Fdir = New IO.DirectoryInfo(PkngInv.getPNPath & "\" & curdate.Year)
            '**** Create Dir for Year if Not Exists

            If Not Fdir.Exists Then
                Fdir.Create()
            End If
            Dim pdfPath As String = String.Format("{0} \ {1}.pdf", Fdir.FullName, PkngNo)
            Dim fileInfo = New System.IO.FileInfo(pdfPath)

            Dim pdfExportFilter1 = New PerpetuumSoft.Reporting.Export.Pdf.PdfExportFilter
            If Not fileInfo.Exists Then

                With pdfExportFilter1
                    .Compress = True
                    .Export(InlineReportSlot2.Document, pdfPath, False)
                End With
            End If
            pdfPath = String.Format("{0}\{1}\PN_{2}.pdf", PkngInv.getWOPath, BS_PN.Current.Item("OrderNo"), PkngNo)
            'Fname = OrderPath & "\" & Replace(BS_PN.Current.item("OrderScheduleNo"), " ", "_") _
            '                    & "\PN_" & BS_PN.Current.item("DC_no") & ".PDF"
            file = New IO.FileInfo(pdfPath)
            If file.Exists Then
                file.Delete()
            End If
            pdfExportFilter1 = New PerpetuumSoft.Reporting.Export.Pdf.PdfExportFilter
            With pdfExportFilter1
                .Compress = True
                .Export(InlineReportSlot2.Document, pdfPath, False)
            End With
        End Using
    End Sub
    Private Sub btn_printDraft_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_printDraft.Click

       save
        With ReportManager1
            .DataSources.Clear()
            .DataSources.Add("PN", BS_PN)

        End With
        ' InlineReportSlot1.DesignTemplate
        DcInvNo = DGV_PNList.CurrentRow.Cells("DC_Inv_No").Value
        InlineReportSlot1.Prepare()
        Using X As New PerpetuumSoft.Reporting.View.PreviewForm(InlineReportSlot1)
            X.WindowState = FormWindowState.Maximized

            X.ShowDialog()
        End Using
    End Sub


    Private Sub ReportManager1_GetReportParameter(ByVal sender As Object, ByVal e As PerpetuumSoft.Reporting.Components.GetReportParameterEventArgs) Handles ReportManager1.GetReportParameter
        e.Parameters("DcInvNo").Value = BS_PN.Current("DC_Inv_No")
        newDc = PkngandInvoice1.draft_dc_inv_register.FindByDC_Inv_No(BS_PN.Current("DC_Inv_No"))
        If e.TemplateName = "doc_PkngNote" Then
            If PkngInv.getCustData(BS_PN.Current.item("Cust_Code")).IsGSTNoNull OrElse
                PkngInv.getCustData(BS_PN.Current.item("Cust_Code")).GSTNo.Length = 0 Then
                e.Parameters("GSTNo").Value = "Unregistered"
            Else
                e.Parameters("GSTNo").Value = newDc.GSTNo
            End If
            e.Parameters("UnitGST").Value = PkngInv.getUnit.Unit_GSTNo
            e.Parameters("PN_No").Value = newDc.DC_No

            e.Parameters("PNDate").Value = newDc.DC_Date
            e.Parameters("PNFinYear").Value = newDc.DC_Fin_Year
        End If


    End Sub
#End Region

    Private Sub btn_OpenInv_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_OpenInv.Click
        Using X As New magodInvoice(BS_PN.Current.item("Dc_Inv_No"))
            X.ShowDialog()
            PkngandInvoice1.draft_dc_inv_details.Clear()
            PkngandInvoice1.draft_dc_inv_register.Clear()
            Orders1.orderscheduledetails.Clear()

            DA_SchDetails.Fill(Orders1.orderscheduledetails)
            Da_PN.Fill(PkngandInvoice1.draft_dc_inv_register)
            Da_PnDetails.Fill(PkngandInvoice1.draft_dc_inv_details)
            resetInDraftParts()
           
        End Using

    End Sub

    Private Sub btn_RaiseRejection_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_RaiseRejection.Click
        BS_scheduleDetails.EndEdit()
        If Orders1.orderscheduledetails.Compute("Count(SchDetailsID)", "Selected") Then
            Using X As New Internal_RejectionForm
                X.CustCode = schRow.Cust_Code
                X.CustName = schRow.Cust_name
                X.ScheduleNo = schRow.OrdSchNo
                X.ScheduleId = schRow.ScheduleId
                X.RaisedBy = "Sales"
                X.InternalReport = True
                X.setLables()
                Dim rejList As New List(Of magod.Orders.orderscheduleorderscheduledetailsRowdetailsRow)
                For Each srl As magod.Orders. In Orders1.orderscheduledetails.Select("Selected")
                    If srl.QtyProduced - srl.QtyCleared - srl.QtyRejected > 0 Then
                        rejList.Add(srl)
                    End If


                Next
                If rejList.Count > 0 Then
                    X.RejectedPartsList = rejList
                    X.ShowDialog()
                    With PkngInv.getCommand
                        .Connection.Open()
                        .Parameters.Clear()
                        .Parameters.AddWithValue("@ScheduleId", intSchId)

                        PkngandInvoice1.internal_rejectionpartslist.Clear()
                        PkngandInvoice1.rejectionslist.Clear()
                        .CommandText = "SELECT * FROM magodmis.rejectionslist r WHERE r.`ScheduleId`=@ScheduleId;"

                        PkngandInvoice1.rejectionslist.Load(.ExecuteReader)

                        .CommandText = "SELECT i.* FROM magodmis.rejectionslist r, magodmis.internal_rejectionpartslist i WHERE r.`ScheduleId`=@ScheduleId AND i.`Rej_Id`=r.`Id`;"

                        PkngandInvoice1.internal_rejectionpartslist.Load(.ExecuteReader)
                        .Connection.Close()
                        Orders1.orderscheduledetails.Clear()
                        DA_SchDetails.Fill(Orders1.orderscheduledetails)
                    End With

                End If

            End Using

        End If

    End Sub

    Private Sub btnReset_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnReset.Click
        BS_scheduleDetails.EndEdit()
        For Each part As magod.Orders.orderscheduledetailsRow In Orders1.orderscheduledetails.Rows
            If part.Selected Then
                part.QtyCleared = part.QtyPacked
                part.Selected = False
            End If
        Next
        DA_SchDetails.Update(Orders1.orderscheduledetails)
        resetInDraftParts()
        MsgBox("Part Quantity Reset")

    End Sub

    Private Sub btn_PrintPN_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btn_PrintPN.Click
        If DGV_PNList.SelectedRows.Count <> 1 Then
            MsgBox("Select PN to Print")
        Else

            PrintPN()
        End If

    End Sub

    Private Sub InlineReportSlot1_GetReportParameter(ByVal sender As Object, ByVal e As PerpetuumSoft.Reporting.Components.GetReportParameterEventArgs) Handles InlineReportSlot1.GetReportParameter
        ' e.Parameters("DcInvNo").Value = BS_PN.Current.item("DC_Inv_No")
    End Sub

    Private Sub DGV_PnDetails_CellClick(ByVal sender As System.Object, ByVal e As System.Windows.Forms.DataGridViewCellEventArgs) Handles DGV_PnDetails.CellClick
        If Not e.RowIndex - 1 Then
            Dim dwgName As String = DGV_PnDetails.Rows(e.RowIndex).Cells("PN_DwgNo").Value
            Dim imgPath As String = String.Format("{0}\{1}\{1}_{2}\PartImage\{3}.jpg", PkngInv.getWOPath, schRow.Order_No, schRow.ScheduleNo, dwgName)
            Try
                If My.Computer.FileSystem.FileExists(imgPath) Then
                    PartImage.ImageLocation = imgPath
                Else
                    PartImage.Image = Nothing
                End If


            Catch ex As Exception

            End Try
            '  pdfPath = String.Format("{0}\{1}\PN_{2}.pdf", PkngInv.getWOPath, BS_PN.Current.Item("OrderNo"), PkngNo)
            'Try
            '    PictureBox1.ImageLocation = Application.StartupPath & "\" & outfile + ".jpg"
            '    ' PictureBox1.Image = bitmap
            '    ' PictureBox1.Refresh()

            '    Dim fs As New FileStream(PictureBox1.ImageLocation, FileMode.OpenOrCreate, FileAccess.Read)
            '    Dim MyData(fs.Length) As Byte
            '    fs.Read(MyData, 0, fs.Length)
            '    fs.Close()

            '    Dim dxf As Data.LayersRow = Data1.Layers.NewLayersRow
            '    dxf.Layer = outfile
            '    dxf.Img = MyData
            '    Data1.Layers.AddLayersRow(dxf)

            'Catch ex As Exception
            '    MsgBox(ex.Message)
            'End Try

        End If
    End Sub


End Class

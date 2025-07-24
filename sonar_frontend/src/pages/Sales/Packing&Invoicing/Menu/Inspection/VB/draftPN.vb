
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
            MsgBox("Customer Address  Missing, Update Customer Address ")
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
            '****** Check if Items wit two types of packing have been selected
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
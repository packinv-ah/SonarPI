Public Class SchedulePicker

    Public Sub New(ByVal Type As String)


        ' This call is required by the Windows Form Designer.
        InitializeComponent()

        ' Add any initialization after the InitializeComponent() call.
        With PkngInv.getCommand

            .CommandText = "SELECT o.* FROM magodmis.orderschedule o " _
                    & "WHERE Not(o.`Schedule_Status`like 'Created' or o.`Schedule_Status`like 'Dispatched' " _
                    & "or o.`Schedule_Status`like 'Closed' or o.`Schedule_Status`like 'Cancelled' " _
                    & "or o.`Schedule_Status`like 'Ready' or o.`Schedule_Status`like 'Suspended' " _
                    & " or o.`Schedule_Status`like 'Comb%') " _
                    & "  AND o.`ScheduleType`not like 'Combined'  AND o.`Type`=@Type  ORDER BY o.`ScheduleDate` desc; "
            .Parameters.Clear()
            .Parameters.AddWithValue("@Type", Type)
            .Connection.Open()
            Orders1.orderschedule.Load(.ExecuteReader)
            .Connection.Close()
        End With

    End Sub
  

    Private Sub Button1_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles Button1.Click
        Using x As New PkngInsp_Schedule(Me.cmb_Schedule.SelectedValue)
            x.ShowDialog()
        End Using
    End Sub
End Class
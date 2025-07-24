import Inspection from "./Inspection/Inspection";
import Invoice from "./Invoice/Invoice";
import PackingNote from "./PackingNote/PackingNote";
import ReturnableDC from "./ReturnableDC/ReturnableDC";
import Setup from "./Setup/Setup";

export default function Menu() {
  return (
    <div className="col">
      <div className="col-md-6">
        <label className="form-label">Select Customer</label>
        <select className="ip-select">
          <option value="option 1"> A A Industries</option>
          <option value="option 2">Test Industries</option>
          <option value="option 3">Ahana Systems and solutions</option>
        </select>
      </div>

      <div className="row mt-5">
        <div className="col-md-2 col-sm-12">
          <Inspection />
        </div>
        <div className="col-md-2 col-sm-12">
          <PackingNote />
        </div>
        <div className="col-md-2 col-sm-12">
          <Invoice />
        </div>
        <div className="col-md-2 col-sm-12">
          <Setup />
        </div>
        <div className="col-md-2 col-sm-12">
          <ReturnableDC />
        </div>
      </div>
    </div>
  );
}

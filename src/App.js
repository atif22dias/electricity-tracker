import { useState, useEffect, useMemo } from "react";

function App() {
  const [name, setName] = useState("");
  const [watt, setWatt] = useState("");
  const [hours, setHours] = useState("");
  const [days, setDays] = useState("");
  const [type, setType] = useState("variable");

  const [editId, setEditId] = useState(null);

  const [list, setList] = useState(() => {
    const saved = localStorage.getItem("appliances");
    return saved ? JSON.parse(saved) : [];
  });

  const [target, setTarget] = useState(() =>
    localStorage.getItem("target") || ""
  );

  const [budget, setBudget] = useState(() =>
    localStorage.getItem("budget") || ""
  );

  const [kwhInput, setKwhInput] = useState("");
  const [billInput, setBillInput] = useState("");

  const num = (v) => (v === "" ? 0 : Number(v));

  useEffect(() => {
    localStorage.setItem("appliances", JSON.stringify(list));
  }, [list]);

  useEffect(() => {
    localStorage.setItem("target", target);
  }, [target]);

  useEffect(() => {
    localStorage.setItem("budget", budget);
  }, [budget]);

  // ⚡ SLAB BILLING
  const calculateBill = (units) => {
    if (units <= 100) return units * 3.96;
    if (units <= 300) return 100 * 3.96 + (units - 100) * 10.8;
    if (units <= 500) return 100 * 3.96 + 200 * 10.8 + (units - 300) * 15.03;
    return 100 * 3.96 + 200 * 10.8 + 200 * 15.03 + (units - 500) * 17.53;
  };

  const estimateKwh = (bill) => {
    if (!bill) return 0;
    let kwh = 1;
    while (kwh < 5000) {
      if (calculateBill(kwh) >= bill) return kwh;
      kwh++;
    }
    return 5000;
  };

  // ⚡ TOTAL USAGE
  const monthlyUnits = useMemo(() => {
    return list.reduce((sum, item) => {
      const w = num(item.watt);
      const h = num(item.hours);
      const d = num(item.days || 30);
      return item.type === "fixed" ? sum + (w * 24 * 30) / 1000 : sum + (w * h * d) / 1000;
    }, 0);
  }, [list]);

  const bill = calculateBill(monthlyUnits);

  // ⚡ TARGET LOGIC
  const targetNum = num(target);
  const isOverTarget = target && targetNum > 0 && monthlyUnits > targetNum;

  // ⚡ BUDGET LOGIC
  const budgetNum = num(budget);
  const overBudget = budget && budgetNum > 0 && bill > budgetNum;

  const handleAdd = () => {
    if (!name || !watt) return;

    const newItem = {
      id: editId || Date.now(),
      name,
      watt: num(watt),
      hours: type === "variable" ? num(hours) : 24,
      days: type === "variable" ? num(days) : 30,
      type,
    };

    if (editId) {
      setList(list.map((i) => (i.id === editId ? newItem : i)));
      setEditId(null);
    } else {
      setList([...list, newItem]);
    }

    setName("");
    setWatt("");
    setHours("");
    setDays("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        {/* HEADER */}
        <h1 className="text-3xl font-bold">⚡ PowerPulse</h1>
        <p className="text-slate-400 mb-6">Electricity tracker with smart billing</p>

        {/* TOP CARDS */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* USAGE */}
          <div className="bg-slate-800 p-4 rounded-2xl">
            <p className="text-slate-400 text-sm">Usage</p>
            <h2 className={`text-xl font-bold ${isOverTarget ? "text-red-400" : "text-emerald-400"}`}>
              {monthlyUnits.toFixed(2)} kWh
            </h2>
          </div>

          {/* BILL */}
          <div className="bg-slate-800 p-4 rounded-2xl">
            <p className="text-slate-400 text-sm">Bill</p>
            <h2 className={`text-xl font-bold ${overBudget ? "text-red-400" : "text-emerald-400"}`}>
              ₹{bill.toFixed(0)}
            </h2>
            {budget && <p className="text-xs text-slate-400 mt-1">Budget: ₹{budget}</p>}
            {overBudget && <p className="text-xs text-red-400 mt-1">⚠ Over Budget</p>}
          </div>

          {/* STATUS */}
          <div className="bg-slate-800 p-4 rounded-2xl">
            <p className="text-slate-400 text-sm">Status</p>
            <h2 className={`text-xl font-bold ${isOverTarget ? "text-red-400" : "text-emerald-400"}`}>
              {target ? (isOverTarget ? "⚠ Usage Over Target" : "✅ Within Target") : "No Target Set"}
            </h2>
          </div>
        </div>

        {/* TARGET + BUDGET INPUTS */}
        <div className="bg-slate-800 p-4 rounded-2xl mb-6 space-y-3">
          <input
            className="w-full p-3 rounded-xl bg-slate-900"
            placeholder="🎯 Monthly Target (kWh)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <input
            className="w-full p-3 rounded-xl bg-slate-900"
            placeholder="💰 Monthly Budget (₹)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        {/* CONVERTER */}
        <div className="bg-slate-800 p-4 rounded-2xl mb-6 space-y-3">
          <h2 className="font-bold">🔁 Converter</h2>
          <input
            className="w-full p-3 rounded-xl bg-slate-900"
            placeholder="Enter kWh"
            value={kwhInput}
            onChange={(e) => {
              setKwhInput(e.target.value);
              setBillInput(calculateBill(num(e.target.value)).toFixed(0));
            }}
          />
          <input
            className="w-full p-3 rounded-xl bg-slate-900"
            placeholder="Enter ₹ bill"
            value={billInput}
            onChange={(e) => {
              setBillInput(e.target.value);
              setKwhInput(estimateKwh(num(e.target.value)).toFixed(2));
            }}
          />
        </div>

        {/* APPLIANCE INPUT */}
        <div className="bg-slate-800 p-4 rounded-2xl mb-6 space-y-3">
          <input
            className="w-full p-3 rounded-xl bg-slate-900"
            placeholder="Appliance name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full p-3 rounded-xl bg-slate-900"
            placeholder="Watt"
            value={watt}
            onChange={(e) => setWatt(e.target.value)}
          />
          <select
            className="w-full p-3 rounded-xl bg-slate-900"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="variable">Variable</option>
            <option value="fixed">Fixed</option>
          </select>

          {type === "variable" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                className="p-3 rounded-xl bg-slate-900"
                placeholder="Hours/day"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              <input
                className="p-3 rounded-xl bg-slate-900"
                placeholder="Days/month"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={handleAdd}
            className="w-full bg-emerald-500 p-3 rounded-xl font-bold"
          >
            {editId ? "Update Appliance" : "Add Appliance"}
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {list.map((item) => {
            const kwh = item.type === "fixed" ? (item.watt * 24 * 30) / 1000 : (item.watt * item.hours * (item.days || 30)) / 1000;
            const cost = calculateBill(kwh);

            return (
              <div key={item.id} className="bg-slate-800 p-4 rounded-2xl">
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-bold">{item.name}</h2>
                    <p className="text-slate-400 text-sm">{item.watt}W • {item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">₹{cost.toFixed(0)}</p>
                    <p className="text-slate-400 text-sm">{kwh.toFixed(2)} kWh</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    className="bg-blue-500 px-3 py-1 rounded"
                    onClick={() => {
                      setName(item.name);
                      setWatt(item.watt);
                      setHours(item.hours);
                      setDays(item.days);
                      setType(item.type);
                      setEditId(item.id);
                      window.scrollTo({ top: 0 });
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="bg-red-500 px-3 py-1 rounded"
                    onClick={() => setList(list.filter((i) => i.id !== item.id))}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default App;
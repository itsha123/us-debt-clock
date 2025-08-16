async function fetchDebt() {
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?fields=tot_pub_debt_out_amt,record_date&sort=-record_date&page[size]=90";
    const response = await fetch(url);
    const { data } = await response.json();
  
    if (!Array.isArray(data) || data.length < 2) return;
  
    const n = data.length;
  
    // API is newest -> oldest. Sum (newer - older) so growth is positive.
    let totChange = 0;
    for (let i = 1; i < n; i++) {
      const newer = Number(data[i - 1].tot_pub_debt_out_amt);
      const older = Number(data[i].tot_pub_debt_out_amt);
      totChange += (newer - older);
    }
  
    // Average change per record interval (not per calendar day)
    const avgChange = totChange / (n - 1);
    
    const totDebt = Number(data[0].tot_pub_debt_out_amt);
  
    // Parse record_date as UTC to avoid timezone drift
    const lastRecordDateUTC = new Date(data[0].record_date + "T00:00:00Z");
    const startTime = Date.UTC(
      lastRecordDateUTC.getUTCFullYear(),
      lastRecordDateUTC.getUTCMonth(),
      lastRecordDateUTC.getUTCDate() + 1, 0, 0, 0, 0
    );
  
    setInterval(() => {
      const elapsedDays = (Date.now() - startTime) / 86400000;
      const todayDebt = totDebt + (elapsedDays * avgChange);
      document.getElementById("tot-debt").textContent =
        todayDebt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }, 50);
  }
  
  fetchDebt();
  
  function statInfo(id) {
    if (id === "tot-debt") {
      const tip = document.getElementById("tooltip-text");
      const src = document.getElementById("source-text");
      if (tip.textContent === "") {
        tip.textContent = "All outstanding US debt.";
        src.textContent = "Source: US Treasury";
        src.setAttribute("href", "https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/");
      } else {
        tip.textContent = "";
        src.textContent = "";
        src.removeAttribute("href");
      }
    }
  }
  

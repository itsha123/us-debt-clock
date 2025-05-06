async function fetchDebt() {
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?fields=tot_pub_debt_out_amt,record_date&sort=-record_date&page[size]=90";
    const response = await fetch(url);
    const json = await response.json();
    let totChange = 0;
    for (i = 1; i < 90; i++) {
        let change = Number(json.data[i].tot_pub_debt_out_amt) - Number(json.data[i - 1].tot_pub_debt_out_amt);
        totChange += change;
    }
    change = totChange / 90;
    const totDebt = Number(json.data[0].tot_pub_debt_out_amt);
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    setInterval(() => {
        let elapsed = (Date.now() - startTime) / 86400000;
        let todayDebt = totDebt + (elapsed * change);
        document.getElementById("tot-debt").innerHTML = `$${Number(todayDebt.toFixed(2)).toLocaleString('en-US')}`;
    }, 50);
}
fetchDebt();

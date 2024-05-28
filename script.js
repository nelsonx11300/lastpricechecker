document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fetchButton').addEventListener('click', fetchAggTrades);
    document.getElementById('fetchHistoricalButton').addEventListener('click', fetchHistoricalTrades);
    document.getElementById('unixTimestamp').addEventListener('input', convertUnixToDateTime);
});

async function fetchAggTrades() {
    const symbol = document.getElementById('symbol').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const limit = document.getElementById('limit').value;
    const timezone = document.getElementById('timezone').value;

    let url = `https://fapi.binance.com/fapi/v1/aggTrades?symbol=${symbol}`;

    if (startTime) {
        url += `&startTime=${startTime}`;
    }
    if (endTime) {
        url += `&endTime=${endTime}`;
    }
    if (limit) {
        url += `&limit=${limit}`;
    }

    // Display the API URL
    document.getElementById('apiUrl').textContent = `API Request URL: ${url}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        displayData(data, timezone);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('output').textContent = 'Error fetching data: ' + error.message;
    }
}

function displayData(data, timezone) {
    const output = document.getElementById('output');
    output.innerHTML = ''; // 清空之前的内容

    let colorClasses = ['color1', 'color2', 'color3'];
    let currentColorIndex = 0;
    let lastTimestamp = null;

    data.forEach((trade, index) => {
        const date = new Date(trade.T);
        const formattedDate = formatDate(date, timezone);

        if (lastTimestamp !== trade.T) {
            currentColorIndex = (currentColorIndex + 1) % colorClasses.length;
            lastTimestamp = trade.T;
        }

        const tradeInfo = `${index + 1}. ID: ${trade.a}, Price: ${trade.p}, Quantity: ${trade.q}, First Trade ID: ${trade.f}, Last Trade ID: ${trade.l}, Timestamp: ${formattedDate}`;
        
        const tradeDiv = document.createElement('div');
        tradeDiv.className = `trade ${colorClasses[currentColorIndex]}`;
        tradeDiv.textContent = tradeInfo;

        output.appendChild(tradeDiv);
    });
}

function formatDate(date, timezone) {
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        fractionalSecondDigits: 3,
        hour12: true,
        timeZone: timezone
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

function convertUnixToDateTime() {
    const unixTimestamp = document.getElementById('unixTimestamp').value;

    if (!unixTimestamp) {
        return;
    }

    const date = new Date(parseInt(unixTimestamp));

    const utc0DateTime = formatDate(date, 'UTC');
    const utc8DateTime = formatDate(date, 'Asia/Shanghai');

    document.getElementById('convertToUtc0').value = utc0DateTime;
    document.getElementById('convertToUtc8').value = utc8DateTime;
}

async function fetchHistoricalTrades() {
    const symbol = document.getElementById('symbolHistorical').value;
    const fromId = document.getElementById('fromId').value;
    const apiKey = document.getElementById('apiKey').value;

    let url = `https://fapi.binance.com/fapi/v1/historicalTrades?symbol=${symbol}&fromId=${fromId}&limit=1`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-MBX-APIKEY': apiKey
            }
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        displayHistoricalData(data);
    } catch (error) {
        console.error('Error fetching historical trades:', error);
        document.getElementById('historicalOutput').textContent = 'Error fetching historical trades: ' + error.message;
    }
}

function displayHistoricalData(data) {
    const historicalOutput = document.getElementById('historicalOutput');
    historicalOutput.innerHTML = JSON.stringify(data, null, 2);
}

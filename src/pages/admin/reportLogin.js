import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, Button } from "antd";
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import xlsx for exporting to Excel

const ReportLogin = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Default: current month
    const [year, setYear] = useState(new Date().getFullYear()); // Default: current year

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/graph/login', {
                params: { month, year } // Send month and year in params
            });
            setData(response.data[0]); // Assuming data is in the first array
        } catch (error) {
            console.error('Error fetching login data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [month, year]); // Re-fetch data when month or year changes

    // Define columns for Ant Design Table
    const columns = [
        {
            title: 'Login Date',
            dataIndex: 'login_date', // Matches the key in your data
            key: 'login_date',
        },
        {
            title: 'Total Users',
            dataIndex: 'total_users', // Matches the key in your data
            key: 'total_users',
        },
    ];

    // Export to Excel function
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data); // Convert JSON data to worksheet
        const workbook = XLSX.utils.book_new(); // Create a new workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report'); // Add the worksheet to the workbook
        XLSX.writeFile(workbook, `Report_Login_${month}_${year}.xlsx`); // Export as an Excel file
    };

    return (
        <div
            style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <div
                style={{
                    width: "80%", // Adjust the width as needed
                    textAlign: "center",
                }}
            >
                <h1>Admin Login</h1>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {/* Select Box for Month */}
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    {/* Select Box for Year */}
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    >
                        {Array.from({ length: 2 }, (_, i) => {
                            const y = new Date().getFullYear() - i; // Display last 2 years
                            return (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div style={{ marginTop: '20px' }}>
                    {loading ? (
                        <p>Loading data...</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="login_date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total_users" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <Button
                                    type="primary"
                                    onClick={exportToExcel}
                                    style={{ marginBottom: '10px' }}
                                >
                                    Export to Excel
                                </Button>
                                <Table
                                    columns={columns} // Pass the columns configuration
                                    dataSource={data} // Pass the data array
                                    rowKey={(record, index) => index} // Set a unique key for each row
                                    bordered // Add borders to the table
                                    pagination={false} // Disable pagination
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportLogin;

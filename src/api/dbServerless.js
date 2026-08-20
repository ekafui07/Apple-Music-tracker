import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';
const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

const CUSTOMERS_TABLE = process.env.DYNAMODB_CUSTOMERS_TABLE || 'paytrack-pro-api-customers-prod';
const ADMINS_TABLE = process.env.DYNAMODB_ADMINS_TABLE || 'paytrack-pro-api-admins-prod';
const HISTORY_TABLE = process.env.DYNAMODB_HISTORY_TABLE || 'paytrack-pro-api-history-prod';

export async function getAdminByEmail(email) {
  const result = await docClient.send(new GetCommand({
    TableName: ADMINS_TABLE,
    Key: { email: email.toLowerCase().trim() }
  }));
  return result.Item || null;
}

export async function setAdminPassword(email, password) {
  await docClient.send(new PutCommand({
    TableName: ADMINS_TABLE,
    Item: {
      email: email.toLowerCase().trim(),
      password,
      updatedAt: new Date().toISOString()
    }
  }));
}

export async function getAllCustomersWithHistory() {
  const customersResult = await docClient.send(new ScanCommand({
    TableName: CUSTOMERS_TABLE
  }));
  const customers = customersResult.Items || [];

  const historyResult = await docClient.send(new ScanCommand({
    TableName: HISTORY_TABLE
  }));
  const allHistory = historyResult.Items || [];

  return customers.map(c => ({
    ...c,
    history: allHistory.filter(h => h.customerId === c.id)
  }));
}

export async function createCustomerInDynamo(customerData) {
  const id = `cust-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const item = {
    id,
    name: customerData.name,
    phone: customerData.phone,
    email: customerData.email || '',
    plan: customerData.plan || 'Individual Plan',
    amount: parseFloat(customerData.amount) || 20.0,
    dueDate: customerData.dueDate,
    status: 'Active',
    paymentMethod: customerData.paymentMethod || 'Mobile Money',
    notes: customerData.notes || '',
    createdAt
  };

  await docClient.send(new PutCommand({
    TableName: CUSTOMERS_TABLE,
    Item: item
  }));

  const historyItem = {
    id: `hist-${Date.now()}`,
    customerId: id,
    date: new Date().toISOString().split('T')[0],
    amount: item.amount,
    status: 'Registered'
  };

  await docClient.send(new PutCommand({
    TableName: HISTORY_TABLE,
    Item: historyItem
  }));

  return { ...item, history: [historyItem] };
}

export async function updateCustomerInDynamo(id, updatedData) {
  const existingResult = await docClient.send(new GetCommand({
    TableName: CUSTOMERS_TABLE,
    Key: { id }
  }));
  const existing = existingResult.Item;
  if (!existing) throw new Error('Subscriber not found');

  const newItem = {
    ...existing,
    ...updatedData,
    amount: updatedData.amount !== undefined ? parseFloat(updatedData.amount) : existing.amount
  };

  await docClient.send(new PutCommand({
    TableName: CUSTOMERS_TABLE,
    Item: newItem
  }));

  return newItem;
}

export async function deleteCustomerFromDynamo(id) {
  await docClient.send(new DeleteCommand({
    TableName: CUSTOMERS_TABLE,
    Key: { id }
  }));
}

export async function recordPaymentInDynamo(id) {
  const existingResult = await docClient.send(new GetCommand({
    TableName: CUSTOMERS_TABLE,
    Key: { id }
  }));
  const customer = existingResult.Item;
  if (!customer) throw new Error('Subscriber not found');

  const curDate = new Date(customer.dueDate || Date.now());
  curDate.setMonth(curDate.getMonth() + 1);
  const nextDueDate = curDate.toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  const historyItem = {
    id: `hist-${Date.now()}`,
    customerId: id,
    date: today,
    amount: customer.amount,
    status: 'Paid'
  };

  await docClient.send(new PutCommand({
    TableName: HISTORY_TABLE,
    Item: historyItem
  }));

  const updatedCustomer = {
    ...customer,
    status: 'Active',
    dueDate: nextDueDate
  };

  await docClient.send(new PutCommand({
    TableName: CUSTOMERS_TABLE,
    Item: updatedCustomer
  }));

  return updatedCustomer;
}

export async function logEmailInDynamo(id, subject, message) {
  const existingResult = await docClient.send(new GetCommand({
    TableName: CUSTOMERS_TABLE,
    Key: { id }
  }));
  const customer = existingResult.Item;
  if (!customer) throw new Error('Subscriber not found');

  const today = new Date().toISOString().split('T')[0];
  const historyItem = {
    id: `hist-${Date.now()}`,
    customerId: id,
    date: today,
    amount: customer.amount,
    status: 'Email Sent'
  };

  await docClient.send(new PutCommand({
    TableName: HISTORY_TABLE,
    Item: historyItem
  }));
}

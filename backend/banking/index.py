'''
Business: API для управления банковскими картами и переводами
Args: event с httpMethod, body, queryStringParameters
      context с request_id, function_name
Returns: HTTP response с балансом, транзакциями или результатом операции
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action', 'balance')
            card_number = params.get('card_number', '2202 2032 4554 4491')
            
            if action == 'balance':
                cur.execute(
                    "SELECT id, card_number, balance, card_type, expiry, cvv FROM cards WHERE card_number = %s",
                    (card_number,)
                )
                card = cur.fetchone()
                
                if not card:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Card not found'}),
                        'isBase64Encoded': False
                    }
                
                card_dict = dict(card)
                card_dict['balance'] = float(card_dict['balance'])
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(card_dict),
                    'isBase64Encoded': False
                }
            
            elif action == 'transactions':
                cur.execute(
                    "SELECT id FROM cards WHERE card_number = %s",
                    (card_number,)
                )
                card = cur.fetchone()
                
                if not card:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Card not found'}),
                        'isBase64Encoded': False
                    }
                
                limit = int(params.get('limit', 10))
                cur.execute(
                    """SELECT id, transaction_type, amount, recipient, description, category, 
                       TO_CHAR(created_at, 'DD Mon HH24:MI') as date 
                       FROM transactions 
                       WHERE card_id = %s 
                       ORDER BY created_at DESC 
                       LIMIT %s""",
                    (card['id'], limit)
                )
                transactions = cur.fetchall()
                
                transactions_list = []
                for t in transactions:
                    t_dict = dict(t)
                    t_dict['amount'] = float(t_dict['amount'])
                    transactions_list.append(t_dict)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(transactions_list),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            card_number = body_data.get('card_number', '2202 2032 4554 4491')
            
            if action == 'transfer':
                amount = Decimal(str(body_data.get('amount', 0)))
                recipient = body_data.get('recipient', '')
                
                if amount <= 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Amount must be positive'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "SELECT id, balance FROM cards WHERE card_number = %s",
                    (card_number,)
                )
                card = cur.fetchone()
                
                if not card:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Card not found'}),
                        'isBase64Encoded': False
                    }
                
                if card['balance'] < amount:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Insufficient funds'}),
                        'isBase64Encoded': False
                    }
                
                new_balance = card['balance'] - amount
                cur.execute(
                    "UPDATE cards SET balance = %s WHERE id = %s",
                    (new_balance, card['id'])
                )
                
                cur.execute(
                    """INSERT INTO transactions (card_id, transaction_type, amount, recipient, description, category) 
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (card['id'], 'expense', amount, recipient, f'Перевод на {recipient}', 'Переводы')
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'new_balance': float(new_balance),
                        'amount': float(amount),
                        'recipient': recipient
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_money':
                amount = Decimal(str(body_data.get('amount', 0)))
                
                if amount <= 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Amount must be positive'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "SELECT id, balance FROM cards WHERE card_number = %s",
                    (card_number,)
                )
                card = cur.fetchone()
                
                if not card:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Card not found'}),
                        'isBase64Encoded': False
                    }
                
                new_balance = card['balance'] + amount
                cur.execute(
                    "UPDATE cards SET balance = %s WHERE id = %s",
                    (new_balance, card['id'])
                )
                
                cur.execute(
                    """INSERT INTO transactions (card_id, transaction_type, amount, description, category) 
                       VALUES (%s, %s, %s, %s, %s)""",
                    (card['id'], 'income', amount, 'Пополнение счета', 'Доход')
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'new_balance': float(new_balance),
                        'amount': float(amount)
                    }),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

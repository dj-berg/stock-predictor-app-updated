import random

def predict_stock(symbol):
    """
    Fake prediction logic.
    Later, you can replace this with a real ML model or stock API.
    """
    base_price = random.uniform(100, 300)
    predicted = round(base_price * random.uniform(0.95, 1.05), 2)
    return predicted

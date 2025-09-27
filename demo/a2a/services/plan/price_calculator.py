class PriceCalculator:
    @staticmethod
    def calculate_price(operations: List[Dict[str, Any]]) -> int:
        """
        Calculate price based on operations:
        - Single operation: base price
        - Multiple operations: discount for bundling
        - Complex operations: higher price
        """
        base_price = 1000  # 0.001 USDC (6 decimals)
        
        if len(operations) == 1:
            return base_price
        elif len(operations) == 2:
            return int(base_price * 1.8)  # 10% discount for 2 operations
        elif len(operations) == 3:
            return int(base_price * 2.5)  # 17% discount for 3 operations
        else:
            return int(base_price * len(operations) * 0.9)  # 10% discount for 4+
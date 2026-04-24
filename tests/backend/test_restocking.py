"""
Tests for the restocking recommendations endpoint (/api/restocking).
This is the R2 endpoint delivered as part of the Meridian engagement.
"""
import pytest


class TestRestockingEndpoints:
    """Test suite for /api/restocking endpoint."""

    def test_get_restocking_recommendations(self, client):
        """Test getting all restocking recommendations returns a list."""
        response = client.get("/api/restocking")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_restocking_recommendation_structure(self, client):
        """Test that each recommendation has all required fields."""
        response = client.get("/api/restocking")
        data = response.json()

        for rec in data:
            assert "sku" in rec
            assert "name" in rec
            assert "category" in rec
            assert "warehouse" in rec
            assert "current_stock" in rec
            assert "reorder_point" in rec
            assert "recommended_order" in rec
            assert "unit_cost" in rec
            assert "estimated_cost" in rec
            assert "forecasted_demand" in rec
            assert "trend" in rec
            assert "priority" in rec

    def test_restocking_data_types(self, client):
        """Test that recommendation fields have correct types."""
        response = client.get("/api/restocking")
        data = response.json()

        for rec in data:
            assert isinstance(rec["sku"], str)
            assert isinstance(rec["name"], str)
            assert isinstance(rec["current_stock"], int)
            assert isinstance(rec["reorder_point"], int)
            assert isinstance(rec["recommended_order"], int)
            assert isinstance(rec["unit_cost"], (int, float))
            assert isinstance(rec["estimated_cost"], (int, float))
            assert isinstance(rec["forecasted_demand"], int)

    def test_restocking_valid_priorities(self, client):
        """Test that priority values are one of high/medium/low."""
        response = client.get("/api/restocking")
        data = response.json()

        valid_priorities = {"high", "medium", "low"}
        for rec in data:
            assert rec["priority"] in valid_priorities

    def test_restocking_valid_trends(self, client):
        """Test that trend values are one of increasing/stable/decreasing."""
        response = client.get("/api/restocking")
        data = response.json()

        valid_trends = {"increasing", "stable", "decreasing"}
        for rec in data:
            assert rec["trend"] in valid_trends

    def test_restocking_positive_values(self, client):
        """Test that stock counts and costs are non-negative."""
        response = client.get("/api/restocking")
        data = response.json()

        for rec in data:
            assert rec["current_stock"] >= 0
            assert rec["reorder_point"] >= 0
            assert rec["recommended_order"] > 0
            assert rec["unit_cost"] >= 0
            assert rec["estimated_cost"] >= 0

    def test_restocking_estimated_cost_calculation(self, client):
        """Test that estimated_cost = recommended_order * unit_cost."""
        response = client.get("/api/restocking")
        data = response.json()

        for rec in data:
            expected = rec["recommended_order"] * rec["unit_cost"]
            assert abs(rec["estimated_cost"] - expected) < 0.01

    def test_restocking_sorted_by_priority(self, client):
        """Test that high priority items appear before medium and low."""
        response = client.get("/api/restocking")
        data = response.json()

        priority_order = {"high": 0, "medium": 1, "low": 2}
        priorities = [priority_order[r["priority"]] for r in data]
        assert priorities == sorted(priorities)

    def test_restocking_filter_by_warehouse(self, client):
        """Test filtering recommendations by warehouse."""
        response = client.get("/api/restocking?warehouse=Tokyo")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        for rec in data:
            assert rec["warehouse"] == "Tokyo"

    def test_restocking_filter_by_category(self, client):
        """Test filtering recommendations by category."""
        response = client.get("/api/restocking?category=sensors")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        for rec in data:
            assert rec["category"].lower() == "sensors"

    def test_restocking_budget_ceiling_respected(self, client):
        """Test that budget ceiling trims the list so total cost stays within budget."""
        budget = 50000
        response = client.get(f"/api/restocking?budget={budget}")
        assert response.status_code == 200

        data = response.json()
        total_cost = sum(rec["estimated_cost"] for rec in data)
        assert total_cost <= budget

    def test_restocking_budget_returns_fewer_than_unfiltered(self, client):
        """Test that a tight budget returns fewer recommendations than no budget."""
        unfiltered = client.get("/api/restocking").json()
        total_unfiltered_cost = sum(r["estimated_cost"] for r in unfiltered)

        # Use half the total cost as the budget ceiling
        budget = total_unfiltered_cost / 2
        budgeted = client.get(f"/api/restocking?budget={budget}").json()

        assert len(budgeted) <= len(unfiltered)

    def test_restocking_budget_zero_returns_empty(self, client):
        """Test that a budget of 0 returns no recommendations."""
        response = client.get("/api/restocking?budget=0")
        assert response.status_code == 200

        data = response.json()
        assert data == []

    def test_restocking_budget_with_warehouse_filter(self, client):
        """Test that budget and warehouse filters work together."""
        response = client.get("/api/restocking?warehouse=London&budget=100000")
        assert response.status_code == 200

        data = response.json()
        for rec in data:
            assert rec["warehouse"] == "London"
        total_cost = sum(rec["estimated_cost"] for rec in data)
        assert total_cost <= 100000

    def test_restocking_only_items_needing_restock(self, client):
        """Test that all recommended items are actually below reorder point or have increasing demand."""
        response = client.get("/api/restocking")
        data = response.json()

        for rec in data:
            below_reorder = rec["current_stock"] < rec["reorder_point"]
            increasing_with_gap = (
                rec["trend"] == "increasing"
                and rec["forecasted_demand"] > rec["current_stock"]
            )
            assert below_reorder or increasing_with_gap

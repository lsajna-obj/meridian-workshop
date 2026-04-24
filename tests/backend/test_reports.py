"""
Tests for reports API endpoints (/api/reports/quarterly and /api/reports/monthly-trends).
These are the R1 endpoints fixed as part of the Meridian engagement.
"""
import pytest


class TestQuarterlyReports:
    """Test suite for /api/reports/quarterly endpoint."""

    def test_get_quarterly_reports(self, client):
        """Test getting all quarterly reports returns a list."""
        response = client.get("/api/reports/quarterly")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_quarterly_report_structure(self, client):
        """Test that each quarterly report has all required fields."""
        response = client.get("/api/reports/quarterly")
        data = response.json()

        for q in data:
            assert "quarter" in q
            assert "total_orders" in q
            assert "total_revenue" in q
            assert "avg_order_value" in q
            assert "fulfillment_rate" in q

    def test_quarterly_report_data_types(self, client):
        """Test that quarterly report fields have correct types."""
        response = client.get("/api/reports/quarterly")
        data = response.json()

        for q in data:
            assert isinstance(q["quarter"], str)
            assert isinstance(q["total_orders"], int)
            assert isinstance(q["total_revenue"], (int, float))
            assert isinstance(q["avg_order_value"], (int, float))
            assert isinstance(q["fulfillment_rate"], (int, float))

    def test_quarterly_report_valid_quarter_names(self, client):
        """Test that quarter names follow the Q#-YYYY format."""
        response = client.get("/api/reports/quarterly")
        data = response.json()

        valid_quarters = {"Q1-2025", "Q2-2025", "Q3-2025", "Q4-2025"}
        for q in data:
            assert q["quarter"] in valid_quarters

    def test_quarterly_report_positive_values(self, client):
        """Test that revenue and order counts are non-negative."""
        response = client.get("/api/reports/quarterly")
        data = response.json()

        for q in data:
            assert q["total_orders"] >= 0
            assert q["total_revenue"] >= 0
            assert q["avg_order_value"] >= 0

    def test_quarterly_report_fulfillment_rate_range(self, client):
        """Test that fulfillment rate is between 0 and 100."""
        response = client.get("/api/reports/quarterly")
        data = response.json()

        for q in data:
            assert 0 <= q["fulfillment_rate"] <= 100

    def test_quarterly_report_sorted_by_quarter(self, client):
        """Test that quarters are returned in chronological order."""
        response = client.get("/api/reports/quarterly")
        data = response.json()

        quarters = [q["quarter"] for q in data]
        assert quarters == sorted(quarters)

    def test_quarterly_avg_order_value_calculation(self, client):
        """Test that avg_order_value is consistent with total_revenue and total_orders."""
        response = client.get("/api/reports/quarterly")
        data = response.json()

        for q in data:
            if q["total_orders"] > 0:
                expected_avg = q["total_revenue"] / q["total_orders"]
                assert abs(q["avg_order_value"] - expected_avg) < 0.01

    def test_quarterly_filter_by_warehouse(self, client):
        """Test filtering quarterly data by warehouse."""
        response = client.get("/api/reports/quarterly?warehouse=Tokyo")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        # Tokyo-only data should have fewer or equal orders than unfiltered
        unfiltered = client.get("/api/reports/quarterly").json()
        total_filtered = sum(q["total_orders"] for q in data)
        total_all = sum(q["total_orders"] for q in unfiltered)
        assert total_filtered <= total_all

    def test_quarterly_filter_by_category(self, client):
        """Test filtering quarterly data by category."""
        response = client.get("/api/reports/quarterly?category=sensors")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)

    def test_quarterly_filter_by_month(self, client):
        """Test filtering quarterly data to a single month returns only that month's quarter."""
        response = client.get("/api/reports/quarterly?month=2025-03")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        # March belongs to Q1 — only Q1 should appear
        for q in data:
            assert q["quarter"] == "Q1-2025"

    def test_quarterly_filter_by_quarter_month(self, client):
        """Test filtering quarterly data using a quarter value."""
        response = client.get("/api/reports/quarterly?month=Q2-2025")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        for q in data:
            assert q["quarter"] == "Q2-2025"


class TestMonthlyTrends:
    """Test suite for /api/reports/monthly-trends endpoint."""

    def test_get_monthly_trends(self, client):
        """Test getting monthly trends returns a list."""
        response = client.get("/api/reports/monthly-trends")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_monthly_trend_structure(self, client):
        """Test that each monthly trend entry has all required fields."""
        response = client.get("/api/reports/monthly-trends")
        data = response.json()

        for month in data:
            assert "month" in month
            assert "order_count" in month
            assert "revenue" in month

    def test_monthly_trend_data_types(self, client):
        """Test that monthly trend fields have correct types."""
        response = client.get("/api/reports/monthly-trends")
        data = response.json()

        for month in data:
            assert isinstance(month["month"], str)
            assert isinstance(month["order_count"], int)
            assert isinstance(month["revenue"], (int, float))

    def test_monthly_trend_month_format(self, client):
        """Test that month values follow YYYY-MM format."""
        response = client.get("/api/reports/monthly-trends")
        data = response.json()

        for month in data:
            parts = month["month"].split("-")
            assert len(parts) == 2
            assert parts[0] == "2025"
            assert 1 <= int(parts[1]) <= 12

    def test_monthly_trend_positive_values(self, client):
        """Test that order counts and revenue are non-negative."""
        response = client.get("/api/reports/monthly-trends")
        data = response.json()

        for month in data:
            assert month["order_count"] >= 0
            assert month["revenue"] >= 0

    def test_monthly_trend_sorted_chronologically(self, client):
        """Test that months are returned in chronological order."""
        response = client.get("/api/reports/monthly-trends")
        data = response.json()

        months = [m["month"] for m in data]
        assert months == sorted(months)

    def test_monthly_trend_covers_full_year(self, client):
        """Test that monthly trends cover all 12 months when unfiltered."""
        response = client.get("/api/reports/monthly-trends")
        data = response.json()

        assert len(data) == 12

    def test_monthly_trend_filter_by_warehouse(self, client):
        """Test filtering monthly trends by warehouse."""
        response = client.get("/api/reports/monthly-trends?warehouse=London")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        # London-only revenue should be less than total
        unfiltered = client.get("/api/reports/monthly-trends").json()
        total_filtered = sum(m["revenue"] for m in data)
        total_all = sum(m["revenue"] for m in unfiltered)
        assert total_filtered <= total_all

    def test_monthly_trend_filter_by_category(self, client):
        """Test filtering monthly trends by category."""
        response = client.get("/api/reports/monthly-trends?category=circuit boards")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)

    def test_monthly_trend_filter_by_month(self, client):
        """Test filtering monthly trends to a single month."""
        response = client.get("/api/reports/monthly-trends?month=2025-06")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["month"] == "2025-06"

    def test_monthly_total_matches_quarterly_total(self, client):
        """Test that total revenue across monthly trends matches quarterly total."""
        monthly = client.get("/api/reports/monthly-trends").json()
        quarterly = client.get("/api/reports/quarterly").json()

        monthly_total = sum(m["revenue"] for m in monthly)
        quarterly_total = sum(q["total_revenue"] for q in quarterly)

        assert abs(monthly_total - quarterly_total) < 1.0

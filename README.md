# Trustigo — Detecting Fraud Before Refund

🚀 **Live Deployment:** https://trustigo-e7qs.vercel.app/

**1. Problem Statement**
Analyzes transaction logs for suspicious return behavior
Detects serial return patterns
Identifies anomalies in purchase-return timing
Flags potential receipt manipulation
Explains why a user is considered high-risk

**Problem Title**
Returns Fraud Detection Dashboard

Trustigo: Return Fraud Detection System

**Problem Description**

E-commerce platforms face significant financial losses due to fraudulent return behavior such as serial returning, wardrobing (temporary usage before returning), and receipt manipulation. Manual monitoring becomes ineffective due to massive transaction volumes and evolving fraud strategies.

Trustigo aims to intelligently analyze transaction logs, detect suspicious return patterns, assign interpretable risk scores, and provide clear explanations through an interactive dashboard.

**Target Users**

* E-commerce Fraud Analysis Teams
* Return Management Departments
* Marketplace Administrators
* Risk & Compliance Teams

**Existing Gaps**

* Rule-based fraud detection systems fail against evolving fraud behavior
* Lack of explainability in fraud decisions
* High false-positive rates affecting genuine customers
* Limited behavioral analytics visualization

 2. Problem Understanding & Approach

 **Root Cause Analysis**

Return fraud occurs due to:

* Absence of behavioral monitoring
* Lack of anomaly detection mechanisms
* Manual inspection limitations
* Non-explainable automated decisions

**Solution Strategy**

Trustigo combines:

* Behavioral analytics
* Anomaly detection models
* Risk scoring mechanisms
* Explainable AI insights
* Interactive visualization dashboard

 3. Proposed Solution

 **Solution Overview**

Trustigo is a dashboard-driven fraud detection system that analyzes transaction data to identify suspicious return behavior and classify users based on fraud risk.

**Core Idea**

Detect abnormal return patterns using hybrid logic:

* Rule-based behavioral detection
* Machine learning anomaly detection
* Explainable risk scoring

**Key Features**

* Transaction dataset ingestion
* Serial return detection
* Fast-return (wardrobing) identification
* High-value return abuse detection
* AI-based anomaly detection
* Explainable fraud reasoning
* Interactive analytics dashboard

4. System Architecture

 **High-Level Flow**

User → Frontend Dashboard → Backend APIs → Fraud Detection Model → Dataset → Risk Score → Dashboard Response

**Architecture Description**

The frontend dashboard sends user requests to backend APIs. The backend processes transaction data, applies fraud detection logic and anomaly models, computes risk scores, and returns interpretable fraud insights for visualization.

**Architecture Diagram**
![WhatsApp Image 2026-02-28 at 16 54 29](https://github.com/user-attachments/assets/f1da1174-8b8b-4010-b2a2-1babb50e2805)


5. Database Design


6. Dataset Selected

**Dataset Name**

Trustigo Transaction Dataset

**Source**

Raw data of Amazon and Flipkart

**Data Type**

Structured CSV dataset containing:

* user_id
* order_id
* category
* price
* purchase_date
* return_date

**Selection Reason**

Real Data

**Preprocessing Steps**

* Date normalization
* Missing return handling
* Return duration calculation
* User-wise aggregation
* Feature extraction

 7. Model Selected

**Model Name**

Isolation Forest (Anomaly Detection)

**Selection Reasoning**

* Works well with unlabeled datasets
* Detects behaviorallanomalies efficiently
* Lightweight and fast for hackathon MVP

**Alternatives Considered**

* Local Outlier Factor
* One-Class SVM
* Rule-Based Detection Only

**Evaluation Metrics**

* Anomaly Score
* Fraud Risk Score
* Behavioral Consistency Analysis

 8. Technology Stack

| Layer      | Technology                      |
| ---------- | ------------------------------- |
| Frontend   | HTML, CSS, JavaScript, Chart.js, React |
| Backend    | Python, FastAPI |
| ML/AI      | Scikit-learn, Pandas|
| Database   | CSV-based storage |
| Deployment | Vercel / Render |



 9. API Documentation & Testing

**API Endpoints List**

Endpoint 1**

```
GET /fraud-users
```

Returns all users with calculated risk scores.

**Endpoint 2**

```
GET /user/{user_id}
```

Returns detailed fraud explanation for selected user.

**Endpoint 3**

```
POST /upload-data
```

Uploads transaction dataset.

**API Testing Screenshots**

(Add Postman / Thunder Client screenshots here)

10. Module-wise Development & Deliverables

**Checkpoint 1: Research & Planning**

**Deliverables**

* Problem analysis
* Architecture design
* Dataset planning

**Checkpoint 2: Backend Development**

**Deliverables**

* API creation
* Fraud logic implementation
* Risk scoring module

**Checkpoint 3: Frontend Development**

**Deliverables**

* Dashboard UI
* Visualization components
* User interaction pages

 **Checkpoint 4: Model Training**

**Deliverables**

* Isolation Forest model
* Anomaly scoring

 **Checkpoint 5: Model Integration**

**Deliverables**

* Backend-model integration
* Risk explanation engine

 **Checkpoint 6: Deployment**

**Deliverables**

* Live dashboard
* Working APIs
* Demo-ready system

11. End-to-End Workflow

1. Upload transaction dataset
2. Backend processes user behavior
3. Fraud detection logic + ML model applied
4. Risk score generated
5. Dashboard visualizes fraud insights
6. Analyst reviews explanation

 12. Demo & Video
**Demo Video:** https://drive.google.com/drive/u/0/folders/19SXgKLO1QAgNckAvgK0IkejcFKrc5MYl
**PPT**: https://drive.google.com/drive/u/0/folders/19SXgKLO1QAgNckAvgK0IkejcFKrc5MYl
**Deployment Link:** https://trustigo-e7qs.vercel.app/
**GitHub Repository:** https://github.com/Architap18/Trustigo

 14. Hackathon Deliverables Summary

* Functional Fraud Detection Dashboard
* Explainable Risk Scoring System
* AI-Based Anomaly Detection
* Interactive Visualization Platform

 14. Team Roles & Responsibilities

| Member Name | Role                       | Responsibilities  |
| ----------- | -------------------------- | ----------------- |
| Riddhima    | Backend Developer          | APIs & Logic      |
| Ashmit      | Planning and Execution     | Development       |
| Archita     | Frontend Developer         | Dashboard UI and Testing & PPT|
 
 15. Future Scope & Scalability

 **Short-Term**

* Real-time fraud monitoring
* Automated alerts
* Improved UI analytics

**Long-Term**

* Large-scale database integration
* Graph-based fraud networks
* Deep learning behavioral modeling
* Enterprise e-commerce integration

16. Known Limitations

* Uses synthetic dataset
* Limited real-time streaming capability
* Prototype-level scalability
* Requires larger datasets for production accuracy

17. Impact

Trustigo enables:

* Reduced financial loss due to return fraud
* Fair treatment of genuine customers
* Data-driven fraud investigation
* Scalable fraud management solutions
## Features
- **AI Analytics**: Uses Isolation Forest to detect anomalous return patterns.
- **Explainable AI**: Generates a human-readable explanation alongside a 0-100 risk score based on rule logic.
- **Interactive Dashboard**: Modern dark-themed dashboard showing user behaviors, metrics, and KPI charts.

## Setup Instructions

1. **Backend API setup**
   Ensure Python dependencies are installed (`pip install -r requirements.txt`).
   Run the FastAPI + SQLite backend from the `Trustigo` root:
   ```bash
   uvicorn backend.main:app --reload
   ```
   *Note: On first run or to reset the synthetic DB, trigger the ML pipeline via the Swagger API `/run-fraud-analysis` endpoint.*

2. **Frontend UI start**
   In a separate terminal, navigate into the `frontend/` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## APIs
- Swagger AI docs available running at `http://127.0.0.1:8000/docs`.

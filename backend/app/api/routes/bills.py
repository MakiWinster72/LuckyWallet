from datetime import date
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response, status

from app.api.deps import CurrentUser, DbSession
from app.models import Bill
from app.repositories.bill_repository import BillRepository
from app.schemas.bill import BillCreate, BillResponse, BillUpdate
from app.services.bill_service import (
    BillNotFoundError,
    BillService,
    InvalidBillReferenceError,
)


router = APIRouter(prefix="/bills", tags=["账单"])


def get_service(db: DbSession) -> BillService:
    return BillService(BillRepository(db))


def not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"code": "BILL_NOT_FOUND", "message": "账单不存在"},
    )


def invalid_reference(error: InvalidBillReferenceError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail={"code": "INVALID_BILL_REFERENCE", "message": error.message},
    )


@router.get("", response_model=list[BillResponse])
def list_bills(
    db: DbSession,
    current_user: CurrentUser,
    start_date: date | None = None,
    end_date: date | None = None,
    category_id: Annotated[int | None, Query(gt=0)] = None,
) -> list[Bill]:
    del current_user
    try:
        return get_service(db).list_bills(
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
        )
    except InvalidBillReferenceError as error:
        raise invalid_reference(error) from None


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(
    bill_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> Bill:
    del current_user
    try:
        return get_service(db).get_bill(bill_id)
    except BillNotFoundError:
        raise not_found() from None


@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
def create_bill(
    data: BillCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> Bill:
    try:
        return get_service(db).create_bill(data, created_by=current_user.id)
    except InvalidBillReferenceError as error:
        raise invalid_reference(error) from None


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(
    bill_id: int,
    data: BillUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> Bill:
    del current_user
    try:
        return get_service(db).update_bill(bill_id, data)
    except BillNotFoundError:
        raise not_found() from None
    except InvalidBillReferenceError as error:
        raise invalid_reference(error) from None


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill(
    bill_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> Response:
    del current_user
    try:
        get_service(db).delete_bill(bill_id)
    except BillNotFoundError:
        raise not_found() from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
